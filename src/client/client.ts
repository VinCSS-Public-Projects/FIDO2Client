import EventEmitter from "events";
import path from "path";
import { fromEvent, Observable, of, Subscription } from "rxjs";
import { first, mergeAll, takeUntil } from "rxjs/operators";
import { ClientPinVersion, Fido2SpecVersion } from "../../environment";
import { Fido2Crypto } from "../crypto/crypto";
import { Options } from "../ctap2/cmd/get-info";
import { AuthenticatorData } from "../ctap2/make-credential";
import { IFido2Device } from "../fido2/fido2-device-cli";
import { Fido2ClientErrCancel, Fido2ClientErrExtensionNotImplemented, Fido2ClientErrInvalidParameter, Fido2ClientErrMethodDeprecated, Fido2ClientErrMissingEventListener, Fido2ClientErrMissingParameter, Fido2ClientErrNotAllowed, Fido2ClientErrPinUvAuthProtocolUnsupported, Fido2ClientErrRelyPartyNotAllowed, Fido2ClientErrTimeout, Fido2ClientErrUserVerificationNotCapable } from "../errors/client";
import { MethodNotImplemented } from "../errors/common";
import { Ctap2ErrActionTimeout, Ctap2ErrPinAuthBlocked, Ctap2ErrPinBlocked, Ctap2ErrPinInvalid } from "../errors/ctap2";
import { HmacSecretInput, HmacSecretExtIdentifier, HmacSecretOutput } from "../extension/hmac-secret";
import { logger } from "../log/debug";
import { Modal } from "../modal/modal";
import { verify } from "../sign/bindings";
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
import { Fido2EventDeviceAttach, Fido2EventKeepAlive, Fido2EventSelectDevice, Fido2EventSuccess, Fido2EventDeviceSelected, Fido2EventCancel, Fido2EventPinAvailable, Fido2EventPinInvalid, Fido2EventPinAuthBlocked, Fido2EventPinBlocked, Fido2EventPinValid, Fido2EventTimeout, Fido2EventRequest, Fido2EventResponse, Fido2EventEnterPin, Fido2EventSetPin, Fido2EventError } from "./symbol";

interface IFido2Client {
    makeCredential(origin: string, options: WrapCredentialCreationOptions): Promise<WrapPublicKeyCredential>;
    getAssertion(origin: string, options: WrapCredentialRequestOptions): Promise<WrapPublicKeyCredential>;
    release(): Promise<void>;
}
export interface IClientRequest {
    publisher: string,
    process: string,
    rp: string,
    trusted: boolean
}

export interface IFido2DeviceInfo {
    uv?: boolean;
    uvRetries?: number;
    clientPin?: boolean;
    pinRetries?: number;
}

export class Fido2Client implements IFido2Client {
    private session: Ctap2Session;
    private options: IClientOptions;
    private modal!: Modal;
    private event: EventEmitter;
    private pin!: Observable<string>;
    private device!: Observable<IFido2Device>;
    private request!: Observable<boolean>;
    private cancel!: Observable<void>
    private subs!: Subscription;

    constructor(options: IClientOptions = {}) {

        /**
         * Assign default options.
         */
        let defaultOptions: IClientOptions = {
            defaultModal: true,
            pinUvAuthProtocol: ClientPinVersion.v1,
            transports: ['ble', 'nfc', 'usb'],
        }
        this.options = Object.assign(defaultOptions, options);

        if (this.options.defaultModal) {
            /**
             * Create default modal.
             * @TODO fix me, using import() instead.
             */
            this.modal = new (require('../modal/default').DefaultModal)();
        } else {
            this.modal = new EventEmitter();
        }

        /**
         * Fido2 client session.
         */
        this.session = new Ctap2Session(this.options.pinUvAuthProtocol || ClientPinVersion.v1);

        /**
         * Fido2 event emitter.
         */
        this.event = new EventEmitter();

        /**
         * Create pin observable.
         */
        this.pin = of(
            fromEvent<string>(this.event, Fido2EventPinAvailable, pin => pin),
            fromEvent<string>(this.modal, Fido2EventPinAvailable, pin => pin)
        ).pipe(mergeAll());

        /**
         * Create device observable.
         */
        this.device = of(
            fromEvent<IFido2Device>(this.event, Fido2EventSelectDevice, device => device),
            fromEvent<IFido2Device>(this.modal, Fido2EventSelectDevice, device => device)
        ).pipe(mergeAll());

        /**
         * Create request observable.
         */
        this.request = of(
            fromEvent<boolean>(this.event, Fido2EventResponse, (status) => status),
            fromEvent<boolean>(this.modal, Fido2EventResponse, (status) => status)
        ).pipe(mergeAll());

        /**
         * Create cancel observable.
         */
        this.cancel = of(
            fromEvent<void>(this.event, Fido2EventCancel, () => void 0),
            fromEvent<void>(this.modal, Fido2EventCancel, () => void 0)
        ).pipe(mergeAll());

        /**
         * Subscription.
         */
        this.subs = new Subscription();

        /**
         * 
         */
        let event = this.options.event;
        if (event) {
            event.onRequest && this.event.on(Fido2EventRequest, async (request: IClientRequest) => {
                let status = event?.onRequest && await event.onRequest(request);
                status !== undefined && this.event.emit(Fido2EventResponse, status);
            });

            event.onDeviceAttached && this.event.on(Fido2EventDeviceAttach, async (device: IFido2Device) => {
                let select = event?.onDeviceAttached && await event.onDeviceAttached(device).catch(() => { });
                select && this.event.emit(Fido2EventSelectDevice, select);
            });

            event.onSetPin && this.event.on(Fido2EventSetPin, async () => {
                let pin = event?.onSetPin && await event.onSetPin();
                pin !== undefined && this.event.emit(Fido2EventPinAvailable, pin);
            });

            event.onEnterPin && this.event.on(Fido2EventEnterPin, async () => {
                let pin = event?.onEnterPin && await event.onEnterPin();
                pin !== undefined && this.event.emit(Fido2EventPinAvailable, pin);
            });

            event.onPinInvalid && this.event.on(Fido2EventPinInvalid, async (retries: number) => {
                let pin = event?.onPinInvalid && await event.onPinInvalid(retries);
                this.event.emit(Fido2EventPinAvailable, pin);
            });

            this.event.on(Fido2EventDeviceSelected, event.onDeviceSelected || (() => { }));

            this.event.on(Fido2EventPinValid, event.onPinValid || (() => { }));

            this.event.on(Fido2EventPinAuthBlocked, event.onPinAuthBlocked || (() => { }));

            this.event.on(Fido2EventPinBlocked, event.onPinBlocked || (() => { }));

            this.event.on(Fido2EventSuccess, event.onSuccess || (() => { }));

            this.event.on(Fido2EventKeepAlive, event.onKeepAlive || (() => { }));

            this.event.on(Fido2EventTimeout, event.onTimeout || (() => { }));

            this.event.on(Fido2EventError, event.onError || (() => { }));
        }

        logger.debug('create fido2 client success');
    }

    private get subscription() {
        if (this.subs.closed) this.subs = new Subscription();
        return this.subs;
    }
    private emit(event: string, arg?: IClientRequest | IFido2DeviceInfo | IFido2Device | number): boolean {
        if (this.event.eventNames().includes(event)) return this.event.emit(event, arg);
        if (!this.options.defaultModal) throw new Fido2ClientErrMissingEventListener(event);
        return this.modal.emit(event, arg);
    }
    private async makeExtensionsInput(input: WrapAuthenticationExtensionsClientInputs): Promise<Map<string, any> | undefined> {
        let exts = new Map<string, any>();
        let info = await this.session.ctap2.info;

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
        if (input.hmacCreateSecret && info.extensions.includes(HmacSecretExtIdentifier)) {
            exts.set(HmacSecretExtIdentifier, await new HmacSecretInput(this.session.ctap2.clientPin).make(input.hmacCreateSecret).build());
        }
        if (input.hmacGetSecret && info.extensions.includes(HmacSecretExtIdentifier)) {
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
                if (!(version && version.includes(Fido2SpecVersion.v20))) throw new Fido2ClientErrMethodDeprecated();
                return resolve(undefined);
            }

            /**
             * Get pinUvAuthToken using getPinUvAuthTokenUsingUvWithPermissions
             */
            if (uv && pinUvAuthToken) {
                /** 
                 * @TODO
                */
                throw new MethodNotImplemented();
            }

            /**
             * Get pinUvAuthToken using getPinUvAuthTokenUsingPinWithPermissions
             */
            if (clientPin && pinUvAuthToken) {
                /**
                 * @TODO
                 */
                throw new MethodNotImplemented();
            }

            /**
             * @superseded
             */
            if (clientPin) {
                this.subscription.add(this.pin.subscribe(pin => this.session.ctap2.clientPin.getPinToken(pin).then(pinUvAuthToken => {
                    this.emit(Fido2EventPinValid);
                    resolve(pinUvAuthToken);
                }).catch(async e => {
                    if (e instanceof Ctap2ErrPinInvalid) return this.emit(Fido2EventPinInvalid, await this.session.ctap2.clientPin.getPinRetries());
                    if (e instanceof Ctap2ErrPinAuthBlocked) return this.emit(Fido2EventPinAuthBlocked);
                    if (e instanceof Ctap2ErrPinBlocked) return this.emit(Fido2EventPinBlocked);
                    reject(e);
                })));
                this.emit(Fido2EventEnterPin);
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
                 * Open selected authenticator and perform get authenticator info request.
                 */
                this.session.device.open(device);
                let info = await this.session.ctap2.info;

                /**
                 * Set maxMsgSize for device cli.
                 */
                (await this.session.device.console).setMaxMsgSize(info.maxMsgSize || 1024);

                logger.debug(info);

                /**
                 * Emit selected authenticator info event.
                 */
                this.emit(Fido2EventDeviceSelected, {
                    uv: info.options.uv,
                    clientPin: info.options.clientPin,
                    pinRetries: (info.options.clientPin && !info.options.uv) ? await this.session.ctap2.clientPin.getPinRetries() : 0
                });

                /**
                 * Check pin/uv auth protocol compatible.
                 */
                if (this.options.pinUvAuthProtocol && !info.pinUvAuthProtocols.includes(this.options.pinUvAuthProtocol)) throw new Fido2ClientErrPinUvAuthProtocolUnsupported();

                let { uv, clientPin, pinUvAuthToken } = info.options;

                /**
                 * Built-in user verification method. For example, devices with screen, biometrics, ...
                 * TODO: high priority for built-in user verification method (not specified in the v2.1 specs).
                 */
                if (uv !== undefined) {
                    logger.debug('built-in user verification');

                    /**
                     * Built-in user verification not configured and relying party don't care about user verification.
                     */
                    if (!uv && userVerification === 'discouraged') return resolve({ userVerification: false, pinUvAuthToken: undefined });

                    /**
                     * Built-in user verification not configured and relying party require user verification,
                     * let user to configure built-in user verification.
                     */
                    if (!uv && userVerification !== 'discouraged') {
                        /**
                         * @TODO implement built-in user verification configure.
                         */
                        throw new MethodNotImplemented();
                    }

                    this.internalGetPinUvAuthToken(uv, clientPin, pinUvAuthToken, info.version).then(token => {
                        if (uv) resolve({ userVerification: token === undefined, pinUvAuthToken: token });
                    });
                    return;
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
                            await this.session.ctap2.clientPin.setPin(pin);
                            /**
                             * @TODO verify that the PIN has been configured.
                             */
                            this.internalGetPinUvAuthToken(uv, true, pinUvAuthToken).then(token => {
                                resolve({ userVerification: false, pinUvAuthToken: token });
                            });
                        }));
                        this.emit(Fido2EventEnterPin);
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
            this.subscription.add((await this.session.device.enumerate(this.options.transports)).pipe(takeUntil(this.device)).subscribe(device => {
                logger.debug(device);
                this.emit(Fido2EventDeviceAttach, device);
            }));
        });
    }
    private makeClientRequest(rp: string): IClientRequest {
        let { signer, verified } = verify(process.execPath);
        return {
            publisher: signer,
            process: path.basename(process.execPath),
            rp: rp,
            trusted: verified
        }
    }

    /**
     * 
     * @param origin 
     * @param options 
     * @returns 
     */
    async makeCredential(origin: string, options: WrapCredentialCreationOptions) {
        return await new Promise<WrapPublicKeyCredential>(async (resolve, reject) => {
            let pub = options.publicKey as WrapPublicKeyCredentialCreationOptions;

            /**
             * Validate required parameters.
             */
            if (pub.rp === undefined) return reject(new Fido2ClientErrMissingParameter('rp'));
            if (pub.rp.name === undefined) return reject(new Fido2ClientErrMissingParameter('rp.name'));
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

            logger.debug('before request');

            let timer = setTimeout(() => {
                reject(new Fido2ClientErrTimeout());
            }, pub.timeout || (pub.authenticatorSelection?.userVerification === 'discouraged' ? 12000 : 300000));

            /**
             * Waiting for make credential request.
             */
            this.request.pipe(first()).subscribe(async status => {

                /**
                 * Request deny
                 */
                if (!status) return reject(new Fido2ClientErrNotAllowed());

                /**
                 * Subscribe for cancel event.
                 */
                this.cancel.pipe(first()).subscribe(async () => {
                    /**
                     * Revoke client session, disconnect all fido2 device.
                     */
                    this.session.revoke();

                    /**
                     * Unsubscribe all subscription.
                     */
                    this.subscription.unsubscribe();

                    /**
                     * Cancel ongoing request.
                     */
                    (await this.session.device.console).cancel();

                    reject(new Fido2ClientErrCancel());
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
                    origin: new URL(origin).origin
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
                }, (status) => {
                    this.emit(Fido2EventKeepAlive, status);
                }).then(async credential => {

                    /**
                     * Make credential request almost done.
                     */
                    this.emit(Fido2EventSuccess);

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

                    /**
                     * Cancel timer.
                     */
                    clearTimeout(timer);

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
                     * Unsubscribe all subscription.
                     */
                    this.subscription.unsubscribe();

                    // if (e instanceof Ctap2ErrPinAuthBlocked) return this.emit(Fido2EventPinAuthBlocked);
                    // if (e instanceof Ctap2ErrPinBlocked) return this.emit(Fido2EventPinBlocked);
                    logger.debug(e)
                    if (e instanceof Ctap2ErrActionTimeout) this.emit(Fido2EventTimeout);
                    reject(e);
                });
            });

            /**
             * Start make credential request.
             */
            this.emit(Fido2EventRequest, this.makeClientRequest(pub.rp.id));
        });
    }

    /**
     * 
     * @param origin 
     * @param options 
     * @returns 
     */
    async getAssertion(origin: string, options: WrapCredentialRequestOptions): Promise<WrapPublicKeyCredential> {
        return await new Promise<WrapPublicKeyCredential>(async (resolve, reject) => {
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
            if (pub.timeout && isNaN(pub.timeout)) return reject(new Fido2ClientErrInvalidParameter('timeout'));
            if (pub.rpId && typeof pub.rpId !== 'string') return reject(new Fido2ClientErrInvalidParameter('rpId'));
            if (pub.allowCredentials && pub.allowCredentials instanceof Array === false) return reject(new Fido2ClientErrInvalidParameter('allowCredentials'));
            if (pub.allowCredentials && !pub.allowCredentials.every(x => (ArrayBuffer.isView(x.id) || x.id instanceof ArrayBuffer) && x.type in WrapPublicKeyCredentialType)) return reject(new Fido2ClientErrInvalidParameter('allowCredentials'));
            if (pub.userVerification && typeof pub.userVerification !== 'string') return reject(new Fido2ClientErrInvalidParameter('userVerification'));
            if (new URL(origin).hostname !== pub.rpId) return reject(new Fido2ClientErrRelyPartyNotAllowed());

            logger.debug('before request');

            let timer = setTimeout(() => {
                reject(new Fido2ClientErrTimeout());
            }, pub.timeout || (pub.userVerification === 'discouraged' ? 12000 : 300000));

            /**
             * Waiting for get assertion request.
             */
            this.request.pipe(first()).subscribe(async status => {

                /**
                 * Request deny.
                 */
                if (!status) return reject(new Fido2ClientErrNotAllowed());

                /**
                 * Subscribe for cancel event.
                 */
                this.cancel.pipe(first()).subscribe(async () => {
                    /**
                     * Revoke client session, disconnect all fido2 device.
                     */
                    this.session.revoke();

                    /**
                     * Unsubscribe all subscription.
                     */
                    this.subscription.unsubscribe();

                    /**
                     * Cancel ongoing request.
                     */
                    (await this.session.device.console).cancel();

                    reject(new Fido2ClientErrCancel());
                });

                /**
                 * Migrate type.
                 */
                Object.assign(pub, { challenge: Buffer.from(pub.challenge as ArrayBuffer) });
                pub.allowCredentials && pub.allowCredentials.map(x => Object.assign(x, { id: Buffer.from(x.id as ArrayBuffer) }));

                let userVerification = pub.userVerification || 'required';
                let discoverableCredential: ResidentKeyRequirement = pub.allowCredentials === undefined ? 'required' : 'discouraged';

                let tup = await this.getPinUvAuthToken(userVerification);
                this.session.clientData = {
                    type: 'webauthn.get',
                    challenge: Base64.encode(Buffer.from(pub.challenge as Buffer)),
                    origin: new URL(origin).origin
                }
                let clientData = Buffer.from(JSON.stringify(this.session.clientData));
                this.session.clientDataHash = Fido2Crypto.hash(clientData);

                /**
                 * Create get assertion options.
                 */
                let opt: Options = {};
                if (discoverableCredential === 'required') opt.rk = true;
                if (tup.userVerification) opt.uv = true;

                /**
                 * Get assertion.
                 */
                this.session.ctap2.getAssertion({
                    rpId: pub.rpId || new URL(origin).hostname,
                    clientDataHash: this.session.clientDataHash,
                    allowList: pub.allowCredentials,
                    extensions: pub.extensions ? await this.makeExtensionsInput(pub.extensions) : undefined,
                    options: opt,
                    pinUvAuthParam: tup.pinUvAuthToken ? Fido2Crypto.hmac(tup.pinUvAuthToken, this.session.clientDataHash).slice(0, 16) : undefined,
                    pinUvAuthProtocol: this.options.pinUvAuthProtocol
                }, status => {
                    this.emit(Fido2EventKeepAlive, status);
                }).then(async credentials => {

                    /**
                     * Get assertion request almost done.
                     */
                    this.emit(Fido2EventSuccess);

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

                    /**
                     * Cancel timer.
                     */
                    clearTimeout(timer);

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
                     * Unsubscribe all subscription.
                     */
                    this.subscription.unsubscribe();

                    reject(e);
                });
            });

            /**
             * Start get assertion request.
             */
            this.emit(Fido2EventRequest, this.makeClientRequest(pub.rpId));
        });
    }

    async release(): Promise<void> {
        this.event.removeAllListeners();
        this.modal.removeAllListeners();
        this.session.device.release();
        this.session.revoke();
        this.subscription.unsubscribe();
    }
}