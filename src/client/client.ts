import path from "path";
import { partition, Subject, Subscription } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { ClientPinVersion, Fido2SpecVersion, getLatestSpecVersion } from "../../environment";
import { Fido2Crypto } from "../crypto/crypto";
import { Options } from "../ctap2/cmd/get-info";
import { AuthenticatorData } from "../ctap2/make-credential";
import { IFido2Device } from "../fido2/fido2-device-cli";
import { Fido2ClientErrCancel, Fido2ClientErrExtensionNotImplemented, Fido2ClientErrInvalidParameter, Fido2ClientErrMethodDeprecated, Fido2ClientErrMissingEventListener, Fido2ClientErrMissingParameter, Fido2ClientErrNoCredentials, Fido2ClientErrNotAllowed, Fido2ClientErrPinAuthBlocked, Fido2ClientErrPinBlocked, Fido2ClientErrPinUvAuthProtocolUnsupported, Fido2ClientErrRelyPartyNotAllowed, Fido2ClientErrTimeout, Fido2ClientErrUnknown, Fido2ClientErrUserVerificationNotCapable } from "../errors/client";
import { MethodNotImplemented } from "../errors/common";
import { Ctap2ErrActionTimeout, Ctap2ErrKeepaliveCancel, Ctap2ErrNoCredentials, Ctap2ErrPinAuthBlocked, Ctap2ErrPinBlocked, Ctap2ErrPinInvalid } from "../errors/ctap2";
import { HmacSecretInput, HmacSecretExtIdentifier, HmacSecretOutput } from "../extension/hmac-secret";
import { logger } from "../log/debug";
import { verify } from "../../third_party/sign";
import { WrapAuthenticationExtensionsClientInputs } from "../webauthn/WrapAuthenticationExtensionsClientInputs";
import { WrapAuthenticationExtensionsClientOutputs } from "../webauthn/WrapAuthenticationExtensionsClientOutputs";
import { WrapAuthenticatorAttestationResponse } from "../webauthn/WrapAuthenticatorAttestationResponse";
import { WrapCOSEAlgorithmIdentifier } from "../webauthn/WrapCOSEAlgorithmIdentifier";
import { WrapCredentialCreationOptions } from "../webauthn/WrapCredentialCreateOptions";
import { WrapCredentialRequestOptions } from "../webauthn/WrapCredentialRequestOptions";
import { WrapPublicKeyCredential } from "../webauthn/WrapPublicKeyCredential";
import { WrapPublicKeyCredentialCreationOptions } from "../webauthn/WrapPublicKeyCredentialCreationOptions";
import { WrapPublicKeyCredentialRequestOptions } from "../webauthn/WrapPublicKeyCredentialRequestOptions";
import { WrapPublicKeyCredentialType } from "../webauthn/WrapPublicKeyCredentialType";
import { Base64 } from "./base64";
import { IClientOptions } from "./options";
import { Ctap2Session } from "./session";
import { Fido2Event } from "./event";
import { DeviceCliNotInitialized, DeviceCliTransactionNotFound } from "../errors/device-cli";

interface IFido2Client {
    makeCredential(origin: string, options: WrapCredentialCreationOptions, sameOriginWithAncestors: boolean): Promise<WrapPublicKeyCredential>;
    getAssertion(origin: string, options: WrapCredentialRequestOptions, sameOriginWithAncestors: boolean): Promise<WrapPublicKeyCredential>;
    release(): Promise<void>;
}
export interface IClientRequest {
    publisher: string,
    process: string,
    rp: string,
    trusted: boolean,
    strict: boolean
}

export interface IFido2DeviceInfo {
    uv?: boolean;
    uvRetries?: number;
    clientPin?: boolean;
    pinRetries?: number;
}

export interface IClientObservable {
    type: Fido2Event;
    data?: IClientRequest | IFido2DeviceInfo | IFido2Device | number | boolean | string | void;
}

export class Fido2Client implements IFido2Client {
    private session: Ctap2Session;
    private options: IClientOptions;
    private modal!: Subject<IClientObservable>;
    private pin!: Subject<string>;
    private device!: Subject<IFido2Device>;
    private request!: Subject<boolean>;
    private keepAlive!: Subject<number>;
    private cancel!: Subject<void>
    private error!: Subject<Fido2Event>;
    private clientSubject: Subject<IClientObservable>;
    private subs!: Subscription;

    constructor(options: IClientOptions = {}) {

        /**
         * Assign default options.
         */
        let defaultOptions: IClientOptions = {
            defaultModal: true,
            strictMode: true,
            pinUvAuthProtocol: ClientPinVersion.v1,
            transports: ['ble', 'nfc', 'usb'],
        }
        this.options = Object.assign(defaultOptions, options);

        /**
         * Client modal.
         */
        if (this.options.defaultModal) {
            /**
             * Create default modal.
             * @TODO fix me, using import() instead.
             */
            this.modal = new (require('../modal/default').DefaultModal)();
        } else {
            this.modal = new Subject<IClientObservable>();
        }

        /**
         * Fido2 client session.
         */
        this.session = new Ctap2Session(this.options.pinUvAuthProtocol || ClientPinVersion.v1);

        /**
         * Fido2 client subject. Notify channel for all fido2 event.
         * Those nofity will be handled by default modal or callback provided by the user.
         */
        this.clientSubject = new Subject<IClientObservable>();
        const [obs1, obs2] = partition(this.clientSubject, () => this.options.defaultModal === true);

        /**
         * Nofity to default modal handler.
         */
        obs1.subscribe(this.modal);

        /**
         * Notify to user handler.
         */
        obs2.subscribe(async value => {
            switch (value.type) {

                /**
                 * Required events.
                 */
                case 'fido2-event-request': {
                    let request = value.data as IClientRequest;
                    if (this.options.event?.onRequest) {
                        let status = await this.options.event.onRequest(request).catch(() => { });
                        this.modal.next({ type: 'fido2-event-response', data: !!status });
                        break;
                    }
                }
                case 'fido2-event-enter-pin': {
                    if (this.options.event?.onEnterPin) {
                        let pin = await this.options.event.onEnterPin();
                        this.modal.next({ type: 'fido2-event-pin-available', data: pin });
                        break;
                    }
                }
                case 'fido2-event-set-pin': {
                    if (this.options.event?.onSetPin) {
                        let pin = await this.options.event.onSetPin();
                        this.modal.next({ type: 'fido2-event-pin-available', data: pin });
                        break;
                    }
                }
                case 'fido2-event-device-attach': {
                    if (this.options.event?.onDeviceAttached) {
                        let device = await this.options.event.onDeviceAttached(value.data as IFido2Device);
                        device && this.modal.next({ type: 'fido2-event-select-device', data: device });
                        break;
                    }
                }
                case 'fido2-event-pin-invalid': {
                    if (this.options.event?.onPinInvalid) {
                        let pin = await this.options.event.onPinInvalid(value.data as number);
                        this.modal.next({ type: 'fido2-event-pin-available', data: pin });
                        break;
                    }
                }

                /**
                 * Optional events.
                 */
                case 'fido2-event-device-detach':
                    (this.options.event?.onDeviceDetached || (() => { }))(value.data as IFido2Device);
                    break;

                case 'fido2-event-pin-valid':
                    (this.options.event?.onPinValid || (() => { }))();
                    break;

                case 'fido2-event-device-selected':
                    (this.options.event?.onDeviceSelected || (() => { }))(value.data as IFido2DeviceInfo);
                    break;

                case 'fido2-event-success':
                    (this.options.event?.onSuccess || (() => { }))();
                    break;

                case 'fido2-event-keep-alive':
                    (this.options.event?.onKeepAlive || (() => { }))(value.data as number);
                    break;

                case 'fido2-event-keep-alive-cancel':
                    (this.options.event?.onKeepAliveCancel || (() => { }))();
                    this.modal.next(value);
                    break;

                case 'fido2-event-pin-auth-blocked':
                    (this.options.event?.onPinAuthBlocked || (() => { }))();
                    this.modal.next(value);
                    break;

                case 'fido2-event-pin-blocked':
                    (this.options.event?.onPinBlocked || (() => { }))();
                    this.modal.next(value);
                    break;

                case 'fido2-event-timeout':
                    (this.options.event?.onTimeout || (() => { }))();
                    this.modal.next(value);
                    break;

                case 'fido2-event-error':
                    (this.options.event?.onError || (() => { }))(value.data as Error);
                    this.modal.next(value);
                    break;

                /**
                 * Missing event handlers.
                 */
                default:
                    logger.debug(`unhandled fido2 client subject with type=${value.type}, data=${value.data}`);
                    throw new Fido2ClientErrMissingEventListener(value.type);
            }
        });

        /**
         * Create request Subject.
         */
        this.request = new Subject<boolean>();

        /**
         * Create pin Subject.
         */
        this.pin = new Subject<string>();

        /**
         * Create device Subject.
         */
        this.device = new Subject<IFido2Device>();

        /**
         * Keep alive subject.
         */
        this.keepAlive = new Subject<number>()

        /**
         * Create cancel Subject.
         */
        this.cancel = new Subject<void>();

        /**
         * Create error Subject.
         */
        this.error = new Subject<Fido2Event>();

        /**
         * Subscription.
         */
        this.subs = new Subscription();

        /**
         * Notify from modal.
         */
        this.modal.subscribe(value => {
            switch (value.type) {
                case 'fido2-event-response':
                    this.request.next(value.data as boolean);
                    break;
                case 'fido2-event-pin-available':
                    this.pin.next(value.data as string);
                    break;
                case 'fido2-event-select-device':
                    this.device.next(value.data as IFido2Device);
                    break;
                case 'fido2-event-cancel':
                    this.cancel.next();
                    break;
                case 'fido2-event-request':
                case 'fido2-event-enter-pin':
                case 'fido2-event-pin-valid':
                case 'fido2-event-pin-blocked':
                case 'fido2-event-pin-auth-blocked':
                case 'fido2-event-device-attach':
                case 'fido2-event-device-detach':
                case 'fido2-event-device-selected':
                case 'fido2-event-keep-alive':
                case 'fido2-event-success':
                case 'fido2-event-no-credentials':
                case 'fido2-event-timeout':
                    /**
                     * Drop self event.
                     */
                    break;
                case 'fido2-event-keep-alive-cancel':
                    this.error.next(value.type);
                    break
                case 'fido2-event-error':
                    this.error.next(value.data as Fido2Event);
                    break
                default:
                    /**
                     * Shouldn't go there.
                     */
                    logger.debug(`drop unknown notify with type=${value.type}, data=${value.data}`);
                    break;
            }
        });

        logger.debug('create fido2 client success');
    }

    private get subscription() {
        if (this.subs.closed) this.subs = new Subscription();
        return this.subs;
    }
    private async makeExtensionsInput(input: WrapAuthenticationExtensionsClientInputs): Promise<Map<string, any> | undefined> {
        let exts = new Map<string, any>();
        let info = await this.session.ctap2.info();

        if (input.appid) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.appidExclude) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.uvm) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.credProps) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.largeBlob) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.credentialProtectionPolicy) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.enforceCredentialProtectionPolicy) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.credBlob) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.getCredBlob) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.largeBlobKey) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.minPinLength) {
            throw new Fido2ClientErrExtensionNotImplemented();
        }
        if (input.hmacCreateSecret && info.extensions?.includes(HmacSecretExtIdentifier)) {
            exts.set(HmacSecretExtIdentifier, await new HmacSecretInput(this.session.ctap2.clientPin).make(input.hmacCreateSecret).build());
        }
        if (input.hmacGetSecret && info.extensions?.includes(HmacSecretExtIdentifier)) {
            exts.set(HmacSecretExtIdentifier, await new HmacSecretInput(this.session.ctap2.clientPin).get(input.hmacGetSecret.salt1, input.hmacGetSecret.salt2).build());
        }
        return exts.size ? exts : undefined;
    }
    private async makeExtensionsOutput(output: any): Promise<WrapAuthenticationExtensionsClientOutputs> {
        let exts: WrapAuthenticationExtensionsClientOutputs = {};

        if (output === undefined) {
            return exts
        }
        if (typeof output[HmacSecretExtIdentifier] === 'boolean') {
            exts.hmacCreateSecret = (await new HmacSecretOutput(this.session.ctap2.clientPin).make(output[HmacSecretExtIdentifier]).build()) as boolean;
            delete output[HmacSecretExtIdentifier];
        }
        if (output[HmacSecretExtIdentifier] instanceof Buffer) {
            exts.hmacGetSecret = (await new HmacSecretOutput(this.session.ctap2.clientPin).get(output[HmacSecretExtIdentifier]).build()) as { output1: ArrayBuffer, output2?: ArrayBuffer };
            delete output[HmacSecretExtIdentifier];
        }
        return exts;
    }
    private internalGetPinUvAuthToken(uv?: boolean, clientPin?: boolean, pinUvAuthToken?: boolean, version?: string[]): Promise<Buffer | undefined> {
        return new Promise<Buffer | undefined>((resolve, reject) => {

            /**
            * @deprecated in CTAP 2.1 specs
            */
            if (uv && !pinUvAuthToken) {
                if (!(version && version.includes(Fido2SpecVersion[Fido2SpecVersion.FIDO_2_0]))) throw new Fido2ClientErrMethodDeprecated();
                return resolve(undefined);
            }

            /**
             * Get pinUvAuthToken using getPinUvAuthTokenUsingUvWithPermissions
             */
            if (uv && pinUvAuthToken) {
                /**
                 * @TODO
                 */
                return resolve(undefined);
            }

            /**
             * Get pinUvAuthToken using getPinUvAuthTokenUsingPinWithPermissions
             */
            // if (clientPin && pinUvAuthToken) {
            //     /**
            //      * @TODO
            //      */
            //     return resolve(undefined);
            // }

            /**
             * @superseded
             */
            if (clientPin) {
                this.subscription.add(this.pin.subscribe(pin => this.session.ctap2.clientPin.getPinToken(pin).then(pinUvAuthToken => {
                    this.clientSubject.next({ type: 'fido2-event-pin-valid' });
                    resolve(pinUvAuthToken);
                }).catch(async e => {
                    if (e instanceof Ctap2ErrPinInvalid) return this.clientSubject.next({ type: 'fido2-event-pin-invalid', data: await this.session.ctap2.clientPin.getPinRetries() });
                    if (e instanceof Ctap2ErrPinAuthBlocked) return this.clientSubject.next({ type: 'fido2-event-pin-auth-blocked' });
                    if (e instanceof Ctap2ErrPinBlocked) return this.clientSubject.next({ type: 'fido2-event-pin-blocked' });
                    reject(e);
                })));
                this.clientSubject.next({ type: 'fido2-event-enter-pin' });
                return;
            }

            /**
             * Unreachable
             */
            reject(new Fido2ClientErrUserVerificationNotCapable());
        });
    }
    private getPinUvAuthToken(userVerification: UserVerificationRequirement): Promise<{ userVerification: boolean; pinUvAuthToken: Buffer | undefined; }> {
        return new Promise<{ userVerification: boolean; pinUvAuthToken: Buffer | undefined }>(async (resolve, reject) => {
            this.subscription.add(this.device.pipe(first()).subscribe(async device => {

                /**
                 * Open selected authenticator.
                 */
                await this.session.device.open(device).catch(e => reject(e));

                /**
                 *  Get authenticator info.
                 */
                let info = await this.session.ctap2.info();

                /**
                 * Set info for ctap2 device.
                 */
                this.session.device.info = info;

                /**
                 * Set maxMsgSize for device cli.
                 */
                (await this.session.device.console).setMaxMsgSize(info.maxMsgSize || 1024);

                logger.debug(info);

                /**
                 * Emit selected authenticator info event.
                 */
                this.clientSubject.next({
                    type: 'fido2-event-device-selected',
                    data: {
                        uv: info.options?.uv,
                        clientPin: info.options?.clientPin,
                        pinRetries: info.options?.clientPin ? await this.session.ctap2.clientPin.getPinRetries().catch(e => reject(e)) || undefined : undefined,
                        uvRetries: info.options?.uv ? await this.session.ctap2.clientPin.getUVRetries().catch(e => reject(e)) || undefined : undefined
                    }
                });

                /**
                 * Check pin/uv auth protocol compatible.
                 */
                if (this.options.pinUvAuthProtocol &&
                    !info.pinUvAuthProtocols?.includes(this.options.pinUvAuthProtocol) &&
                    this.options.pinUvAuthProtocol !== ClientPinVersion.v1 &&
                    getLatestSpecVersion(info.version) < Fido2SpecVersion.FIDO_2_0) throw new Fido2ClientErrPinUvAuthProtocolUnsupported();

                let { uv, clientPin, pinUvAuthToken } = info.options || {};

                /**
                 * Built-in user verification method. For example, devices with screen, biometrics, ...
                 * TODO: high priority for built-in user verification method (not specified in the v2.1 specs).
                 */
                if (uv !== undefined) {
                    logger.debug('built-in user verification');

                    /**
                     * Built-in user verification not configured/disabled and relying party don't care about user verification.
                     */
                    // if (!uv && userVerification === 'discouraged') return resolve({ userVerification: false, pinUvAuthToken: undefined });

                    /**
                     * Built-in user verification has been configured/enabled.
                     */
                    if (uv) return this.internalGetPinUvAuthToken(uv, clientPin, pinUvAuthToken, info.version).then(token => {
                        if (uv) resolve({ userVerification: token === undefined, pinUvAuthToken: token });
                    });


                    if (!uv) {
                        /**
                         * Fall back to client pin
                         * @TODO implement built-in user verification configure.
                         */
                    }
                }

                if (clientPin !== undefined) {
                    logger.debug('client-pin user verification');

                    /**
                     * Client PIN not configured and relying party don't care about user verification.
                     */
                    if (!clientPin && userVerification === 'discouraged') {
                        return resolve({ userVerification: false, pinUvAuthToken: undefined });
                    }

                    /**
                     * Client PIN not configured and relying party require user verification,
                     * let user to configure PIN.
                     */
                    if (!clientPin && userVerification !== 'discouraged') {
                        this.subscription.add(this.pin.pipe(first()).subscribe(async pin => {
                            await this.session.ctap2.clientPin.setPin(pin).catch(e => reject(e));
                            /**
                             * @TODO verify that the PIN has been configured.
                             */
                            this.internalGetPinUvAuthToken(uv, true, pinUvAuthToken).then(token => {
                                resolve({ userVerification: false, pinUvAuthToken: token });
                            });
                        }));
                        this.clientSubject.next({ type: 'fido2-event-enter-pin' });
                        return;
                    }

                    this.internalGetPinUvAuthToken(uv, true, pinUvAuthToken).then(token => {
                        resolve({ userVerification: false, pinUvAuthToken: token });
                    });
                    return;
                }

                /**
                 * Relying party don't care about user verification.
                 */
                if (userVerification === 'discouraged') {
                    return resolve({ userVerification: false, pinUvAuthToken: undefined });
                }

                /**
                 * Authenticator not capable any user verification method.
                 */
                throw new Fido2ClientErrUserVerificationNotCapable();
            }));

            /**
             * Subscribe for device attach.
             */
            this.subscription.add((await this.session.device.enumerate(this.options.transports)).pipe(takeUntil(this.device)).subscribe({
                next: device => {
                    logger.debug(device);
                    this.clientSubject.next({ type: device.status === 'attach' ? 'fido2-event-device-attach' : 'fido2-event-device-detach', data: device.device });
                },
                error: e => logger.debug(e)
            }));
        });
    }
    private makeClientRequest(rp: string): IClientRequest {
        let { signer, verified } = verify(process.execPath);
        return {
            publisher: signer,
            process: path.basename(process.execPath),
            rp: rp,
            trusted: verified,
            strict: !!this.options.strictMode
        }
    }

    private onCancel() {
        this.session.device.console.then(async x => {

            /**
             * Cancel current transaction.
             */
            await x.cancel();

        }).catch((e) => {

            /**
             * Device cli not available. No need to release device cli.
             */
            if (e instanceof DeviceCliNotInitialized) return this.error.next('fido2-event-cancel');

            /**
             * Transaction not found.
             */
            if (e instanceof DeviceCliTransactionNotFound) return this.error.next('fido2-event-cancel');

            /**
             * Unhandled error.
             */
            this.error.next('fido2-event-unknown-error');
        });
    }

    private onError(type: string, reject: (reason: Error) => void) {

        /**
         * Revoke client session, disconnect all fido2 device.
         */
        this.session.revoke();

        /**
         * Unsubscribe all subscription.
         */
        this.subscription.unsubscribe();

        /**
         * Reject error to caller.
         */
        switch (type) {
            case 'fido2-event-request-not-allowed':
                reject(new Fido2ClientErrNotAllowed());
                break;
            case 'fido2-event-timeout':
                reject(new Fido2ClientErrTimeout());
                break;
            case 'fido2-event-cancel':
            case 'fido2-event-keep-alive-cancel':
                reject(new Fido2ClientErrCancel());
                break;
            case 'fido2-event-unknown-error':
                reject(new Fido2ClientErrUnknown());
                break;
            case 'fido2-event-pin-auth-blocked':
                reject(new Fido2ClientErrPinAuthBlocked());
                break;
            case 'fido2-event-pin-blocked':
                reject(new Fido2ClientErrPinBlocked());
                break;
            default:
                logger.debug(`unhandled error ${type}`);
                reject(new Error(`Unhandled error ${type}`));
                break;
        }
    }

    /**
     * 
     * @param origin 
     * @param options 
     * @returns 
     */
    async makeCredential(origin: string, options: WrapCredentialCreationOptions, sameOriginWithAncestors: boolean = true) {
        return await new Promise<WrapPublicKeyCredential>(async (resolve, reject) => {

            /**
             * Options for Credential Creation
             * https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialcreationoptions
             */
            let pub = options.publicKey as WrapPublicKeyCredentialCreationOptions;

            /**
             * Validate required parameters.
             */
            if (pub.rp === undefined) return reject(new Fido2ClientErrMissingParameter('rp'));
            if (pub.rp.name === undefined) return reject(new Fido2ClientErrMissingParameter('rp.name'));
            if (pub.user === undefined) return reject(new Fido2ClientErrMissingParameter('user'));
            if (pub.user.name === undefined) return reject(new Fido2ClientErrMissingParameter('user.name'));
            if (pub.user.displayName === undefined) return reject(new Fido2ClientErrMissingParameter('user.displayName'));
            /**
             * @TODO
             * Force required icon.
             */
            if (pub.user.icon === undefined) pub.user.icon = `${pub.user.name}.ico`;
            if (pub.user.id === undefined) return reject(new Fido2ClientErrMissingParameter('user.id'));
            if (pub.challenge === undefined) return reject(new Fido2ClientErrMissingParameter('challenge'));
            if (pub.pubKeyCredParams === undefined) return reject(new Fido2ClientErrMissingParameter('pubKeyCredParams'));

            /**
             * Validate required parameters type.
             */
            if (typeof pub.rp.name !== 'string') return reject(new Fido2ClientErrInvalidParameter('rp.name'));
            /**
             * @TODO
             * Fore rpId to origin.
             */
            if (typeof pub.rp.id !== 'string') pub.rp.id = new URL(origin).origin;
            if (typeof pub.user.name !== 'string') return reject(new Fido2ClientErrInvalidParameter('user.name'));
            if (typeof pub.user.displayName !== 'string') return reject(new Fido2ClientErrInvalidParameter('user.displayName'));
            if (typeof pub.user.icon !== 'string') return reject(new Fido2ClientErrInvalidParameter('user.icon'));
            if (ArrayBuffer.isView(pub.user.id) === false && (pub.user.id instanceof ArrayBuffer) === false) return reject(new Fido2ClientErrInvalidParameter('user.id'));
            if (ArrayBuffer.isView(pub.challenge) === false && (pub.challenge instanceof ArrayBuffer) === false) return reject(new Fido2ClientErrInvalidParameter('challenge'));
            if ((pub.pubKeyCredParams instanceof Array) === false) return reject(new Fido2ClientErrInvalidParameter('pubKeyCredParams'));
            if (!pub.pubKeyCredParams.every(x => x.alg in WrapCOSEAlgorithmIdentifier && x.type in WrapPublicKeyCredentialType)) return reject(new Fido2ClientErrInvalidParameter('pubKeyCredParams'));

            /**
             * Validate optional parameters.
             */
            if (pub.timeout && isNaN(pub.timeout)) return reject(new Fido2ClientErrInvalidParameter('timeout'));
            // TODO: check exclude credential element type
            if (pub.excludeCredentials && pub.excludeCredentials instanceof Array === false) return reject(new Fido2ClientErrInvalidParameter('excludeCredentials'));
            if (pub.authenticatorSelection?.authenticatorAttachment && typeof pub.authenticatorSelection.authenticatorAttachment !== 'string') return reject(new Fido2ClientErrInvalidParameter('authenticatorSelection.authenticatorAttachment'));
            if (pub.authenticatorSelection?.residentKey && typeof pub.authenticatorSelection?.residentKey !== 'string') return reject(new Fido2ClientErrInvalidParameter('authenticatorSelection.residentKey'));
            if (pub.authenticatorSelection?.requireResidentKey && typeof pub.authenticatorSelection?.requireResidentKey !== 'boolean') return reject(new Fido2ClientErrInvalidParameter('authenticatorSelection.requireResidentKey'));
            if (pub.authenticatorSelection?.userVerification && typeof pub.authenticatorSelection?.userVerification !== 'string') return reject(new Fido2ClientErrInvalidParameter('authenticatorSelection.userVerification'));
            if (pub.attestation && typeof pub.attestation !== 'string') return reject(new Fido2ClientErrInvalidParameter('attestation'));

            // if (new URL(origin).origin !== origin) throw new Fido2ClientErrRelyPartyNotAllowed();

            /**
             * Set timeout for request.
             */
            this.session.timeout = setTimeout(() => this.clientSubject.next({ type: 'fido2-event-timeout' }), pub.timeout || (pub.authenticatorSelection?.userVerification === 'discouraged' ? 120000 : 300000));

            /**
             * Subscribe for cancel event.
             */
            this.subscription.add(this.cancel.pipe(first()).subscribe(() => this.onCancel()));

            /**
             * Subscribe for error event.
             */
            this.subscription.add(this.error.pipe(first()).subscribe(x => this.onError(x, reject)));

            /**
             * Subscribe for request event.
             */
            this.subscription.add(this.request.pipe(first()).subscribe(async status => {

                /**
                 * Request deny
                 */
                if (!status) return this.error.next('fido2-event-request-not-allowed');

                /**
                 * Subscribe for keep alive event.
                 */
                this.keepAlive.pipe(takeUntil(this.cancel)).subscribe(status => {
                    this.clientSubject.next({ type: 'fido2-event-keep-alive', data: status });
                });

                /**
                 * Migrate types.
                 */
                Object.assign(pub, { challenge: Buffer.from(pub.challenge as ArrayBuffer) });
                Object.assign(pub.user, { id: Buffer.from(pub.user.id as ArrayBuffer) });
                pub.excludeCredentials && pub.excludeCredentials.map(x => Object.assign(x, { id: Buffer.from(x.id as ArrayBuffer) }));

                let userVerification = pub.authenticatorSelection?.userVerification || 'required';
                let discoverableCredential = pub.authenticatorSelection?.residentKey || 'discouraged';
                if (pub.authenticatorSelection?.requireResidentKey) discoverableCredential = 'required';

                let tup = await this.getPinUvAuthToken(userVerification);
                this.session.clientData = {
                    type: 'webauthn.create',
                    challenge: Base64.encode(Buffer.from(pub.challenge as ArrayBuffer)),
                    origin: new URL(origin).origin,
                    crossOrigin: !sameOriginWithAncestors
                }
                let clientData = Buffer.from(JSON.stringify(this.session.clientData));
                this.session.clientDataHash = Fido2Crypto.hash(clientData);

                /**
                 * Create make credential options.
                 */
                let opt: Options = {};
                if (discoverableCredential === 'required') opt.rk = true;
                if (tup.userVerification) opt.uv = true;

                /**
                 * Make credential.
                 */
                this.session.ctap2.makeCredential({
                    clientDataHash: this.session.clientDataHash,
                    rp: pub.rp,
                    user: pub.user,
                    pubKeyCredParams: pub.pubKeyCredParams,
                    excludeList: pub.excludeCredentials,
                    extensions: pub.extensions ? await this.makeExtensionsInput(pub.extensions) : undefined,
                    options: opt,
                    pinUvAuthParam: tup.pinUvAuthToken ? Fido2Crypto.hmac(tup.pinUvAuthToken, this.session.clientDataHash).slice(0, 16) : undefined,
                    pinUvAuthProtocol: this.options.pinUvAuthProtocol,
                }, this.keepAlive).then(async credential => {

                    /**
                     * Make credential request almost done.
                     */
                    this.clientSubject.next({ type: 'fido2-event-success' });

                    /**
                     * Parse authenticator data.
                     */
                    let authData = new AuthenticatorData(credential.authData);
                    let extensions = await this.makeExtensionsOutput(authData.extensions);

                    /**
                     * Revoke client session, disconnect all fido2 device.
                     */
                    this.session.revoke();

                    /**
                     * Unsubscribe all subscription.
                     */
                    this.subscription.unsubscribe();

                    // logger.debug({
                    //     id: Base64.encode(authData.attestedCredentialData?.credentialId as Buffer),
                    //     rawId: authData.attestedCredentialData?.credentialId.buffer.slice(authData.attestedCredentialData?.credentialId.byteOffset, authData.attestedCredentialData?.credentialId.byteOffset + authData.attestedCredentialData?.credentialId.byteLength) as ArrayBuffer,
                    //     type: 'public-key',
                    //     response: new WrapAuthenticatorAttestationResponse(credential, clientData),
                    //     clientExtensionResults: extensions,
                    //     // getClientExtensionResults: () => extensions
                    // });

                    /**
                     * Resolve credential, request success.
                     */
                    return resolve({
                        id: Base64.encode(authData.attestedCredentialData?.credentialId as Buffer),
                        rawId: authData.attestedCredentialData?.credentialId.buffer.slice(authData.attestedCredentialData?.credentialId.byteOffset, authData.attestedCredentialData?.credentialId.byteOffset + authData.attestedCredentialData?.credentialId.byteLength) as ArrayBuffer,
                        type: 'public-key',
                        response: new WrapAuthenticatorAttestationResponse(credential, clientData),
                        clientExtensionResults: extensions,
                        // getClientExtensionResults: () => extensions
                    });
                }).catch(e => {

                    /**
                     * Request timeout.
                     */
                    if (e instanceof Ctap2ErrActionTimeout) return this.clientSubject.next({ type: 'fido2-event-timeout' });

                    /**
                     * Keep alive cancel.
                     */
                    if (e instanceof Ctap2ErrKeepaliveCancel) return this.clientSubject.next({ type: 'fido2-event-keep-alive-cancel' });

                    /**
                     * Reject errors to caller.
                     */
                    this.error.next(e);
                });
            }));

            /**
             * Notify make credential request.
             */
            this.clientSubject.next({ type: 'fido2-event-request', data: this.makeClientRequest(pub.rp.id) });
        });
    }

    /**
     * 
     * @param origin 
     * @param options 
     * @returns 
     */
    async getAssertion(origin: string, options: WrapCredentialRequestOptions, sameOriginWithAncestors: boolean = true): Promise<WrapPublicKeyCredential> {
        return await new Promise<WrapPublicKeyCredential>(async (resolve, reject) => {

            /**
             * Options for Credential Creation
             * https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialcreationoptions
             */
            let pub = options.publicKey as WrapPublicKeyCredentialRequestOptions;

            /**
             * Validate required parameters.
             */
            if (pub.challenge === undefined) return reject(new Fido2ClientErrMissingParameter('challenge'));

            /**
             * Validate required parameters type.
             */
            if (ArrayBuffer.isView(pub.challenge) === false && (pub.challenge instanceof ArrayBuffer) === false) return reject(new Fido2ClientErrMissingParameter('challenge'));

            /**
             * Validate optional parameters.
             */
            if (!pub.allowCredentials?.length ) pub.allowCredentials = undefined;
            if (pub.timeout && isNaN(pub.timeout)) return reject(new Fido2ClientErrInvalidParameter('timeout'));
            if (pub.rpId && typeof pub.rpId !== 'string') return reject(new Fido2ClientErrInvalidParameter('rpId'));
            if (pub.allowCredentials && pub.allowCredentials instanceof Array === false) return reject(new Fido2ClientErrInvalidParameter('allowCredentials'));
            if (pub.allowCredentials && !pub.allowCredentials.every(x => (ArrayBuffer.isView(x.id) || x.id instanceof ArrayBuffer) && x.type in WrapPublicKeyCredentialType)) return reject(new Fido2ClientErrInvalidParameter('allowCredentials'));
            if (pub.userVerification && typeof pub.userVerification !== 'string') return reject(new Fido2ClientErrInvalidParameter('userVerification'));
            if (new URL(origin).hostname !== pub.rpId) return reject(new Fido2ClientErrRelyPartyNotAllowed());

            /**
             * Set timer for request timeout.
             */
            this.session.timeout = setTimeout(() => this.clientSubject.next({ type: 'fido2-event-timeout' }), pub.timeout || (pub.userVerification === 'discouraged' ? 120000 : 300000));

            /**
             * Subscribe for cancel event.
             */
            this.subscription.add(this.cancel.pipe(first()).subscribe(() => this.onCancel()));

            /**
             * Subscribe for error event.
             */
            this.subscription.add(this.error.pipe(first()).subscribe(x => this.onError(x, reject)));

            /**
             * Subscribe for request event.
             */
            this.subscription.add(this.request.pipe(first()).subscribe(async status => {

                /**
                 * Request deny.
                 */
                if (!status) return this.error.next('fido2-event-request-not-allowed');

                /**
                 * Subscribe for keep-alive event.
                 */
                this.keepAlive.pipe(takeUntil(this.cancel)).subscribe(status => {
                    this.clientSubject.next({ type: 'fido2-event-keep-alive', data: status });
                });

                /**
                 * Migrate type.
                 */
                Object.assign(pub, { challenge: Buffer.from(pub.challenge as ArrayBuffer) });
                pub.allowCredentials && pub.allowCredentials.map(x => Object.assign(x, { id: Buffer.from(x.id as ArrayBuffer) }));

                let token = await this.getPinUvAuthToken(pub.userVerification || 'required');

                /**
                 * Collected client data.
                 */
                this.session.clientData = {
                    type: 'webauthn.get',
                    challenge: Base64.encode(Buffer.from(pub.challenge as Buffer)),
                    origin: new URL(origin).origin,
                    crossOrigin: !sameOriginWithAncestors
                }
                let clientData = Buffer.from(JSON.stringify(this.session.clientData));

                /**
                 * Client data hash.
                 */
                this.session.clientDataHash = Fido2Crypto.hash(clientData);

                /**
                 * Create get assertion options.
                 */
                let opt: Options = {};

                /**
                 * Empty allow lists.
                 */
                //if (pub.allowCredentials === undefined) opt.rk = true;

                /**
                 * @deprecated in CTAP 2.1
                 */
                if (token.userVerification) opt.uv = true;

                /**
                 * Get assertion.
                 */
                this.session.ctap2.getAssertion({
                    rpId: pub.rpId || new URL(origin).hostname,
                    clientDataHash: this.session.clientDataHash,
                    allowList: pub.allowCredentials,
                    extensions: pub.extensions ? await this.makeExtensionsInput(pub.extensions) : undefined,
                    options: opt,
                    pinUvAuthParam: token.pinUvAuthToken ? Fido2Crypto.hmac(token.pinUvAuthToken, this.session.clientDataHash).slice(0, 16) : undefined,
                    pinUvAuthProtocol: this.options.pinUvAuthProtocol
                }, this.keepAlive).then(async credentials => {

                    /**
                     * Get assertion request almost done.
                     */
                    this.clientSubject.next({ type: 'fido2-event-success' });

                    /**
                     * @TODO select credential.
                     */
                    let credential = credentials[0];

                    /**
                     * Parse authenticator data.
                     */
                    let authData = new AuthenticatorData(credential.authData);
                    let extensions = await this.makeExtensionsOutput(authData.extensions);
                    let id = credential.credential.id as Buffer;
                    let userHandle = credential.user?.id;

                    /**
                     * Revoke client session, disconnect all fido2 device.
                     */
                    this.session.revoke();

                    /**
                     * Unsubscribe all subscription.
                     */
                    this.subscription.unsubscribe();

                    // logger.debug(JSON.stringify({
                    //     id: Base64.encode(id),
                    //     rawId: Base64.encode(id),
                    //     type: 'public-key',
                    //     response: {
                    //         clientDataJSON: clientData.toString('base64url'),
                    //         authenticatorData: credential.authData.toString('base64url'),
                    //         signature: credential.signature.toString('base64url'),
                    //         userHandle: userHandle && userHandle instanceof Buffer && userHandle.toString('base64url')
                    //     },
                    //     clientExtensionResults: extensions,
                    //     // getClientExtensionResults: () => extensions
                    // }));

                    /**
                     * Resolve credential, get assertion request success.
                     */
                    resolve({
                        id: Base64.encode(id),
                        rawId: id.buffer.slice(id.byteOffset, id.byteOffset + id.byteLength),
                        type: 'public-key',
                        response: {
                            clientDataJSON: clientData.buffer.slice(clientData.byteOffset, clientData.byteOffset + clientData.byteLength),
                            authenticatorData: credential.authData.buffer.slice(credential.authData.byteOffset, credential.authData.byteOffset + credential.authData.byteLength),
                            signature: credential.signature.buffer.slice(credential.signature.byteOffset, credential.signature.byteOffset + credential.signature.byteLength),
                            userHandle: userHandle && userHandle instanceof Buffer && userHandle.buffer.slice(userHandle.byteOffset, userHandle.byteOffset + userHandle.byteLength)
                        } as AuthenticatorAssertionResponse,
                        clientExtensionResults: extensions,
                        // getClientExtensionResults: () => extensions
                    });
                }).catch(e => {

                    /**
                    * Request timeout.
                    */
                    if (e instanceof Ctap2ErrActionTimeout) return this.clientSubject.next({ type: 'fido2-event-timeout' });

                    /**
                     * No credentials found on authenticator.
                     */
                    if (e instanceof Ctap2ErrNoCredentials) return this.clientSubject.next({ type: 'fido2-event-no-credentials' });

                    /**
                    * Keep alive cancel.
                    */
                    if (e instanceof Ctap2ErrKeepaliveCancel) return this.clientSubject.next({ type: 'fido2-event-keep-alive-cancel' });

                    /**
                     * Reject unhandled errors to caller.
                     */
                    this.error.next(e);
                });
            }));

            /**
             * Notify get assertion request.
             */
            this.clientSubject.next({ type: 'fido2-event-request', data: this.makeClientRequest(pub.rpId) });
        });
    }

    async release(): Promise<void> {
        this.session.device.release();
        this.session.revoke();
        this.subscription.unsubscribe();
    }
}