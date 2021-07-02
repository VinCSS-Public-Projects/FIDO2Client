"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fido2Client = void 0;
const events_1 = __importDefault(require("events"));
const path_1 = __importDefault(require("path"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const environment_1 = require("../../environment");
const crypto_1 = require("../crypto/crypto");
const make_credential_1 = require("../ctap2/make-credential");
const client_1 = require("../errors/client");
const common_1 = require("../errors/common");
const ctap2_1 = require("../errors/ctap2");
const hmac_secret_1 = require("../extension/hmac-secret");
const debug_1 = require("../log/debug");
const bindings_1 = require("../sign/bindings");
const WrapAuthenticatorAttestationResponse_1 = require("../webauthn/WrapAuthenticatorAttestationResponse");
const WrapCOSEAlgorithmIdentifier_1 = require("../webauthn/WrapCOSEAlgorithmIdentifier");
const WrapPublicKeyCredentialType_1 = require("../webauthn/WrapPublicKeyCredentialType");
const base64_1 = require("./base64");
const session_1 = require("./session");
const symbol_1 = require("./symbol");
class Fido2Client {
    constructor(options = {}) {
        /**
         * Assign default options.
         */
        let defaultOptions = {
            defaultModal: true,
            pinUvAuthProtocol: environment_1.ClientPinVersion.v1,
            transports: ['ble', 'nfc', 'usb'],
        };
        this.options = Object.assign(defaultOptions, options);
        if (this.options.defaultModal) {
            /**
             * Create default modal.
             * @TODO fix me, using import() instead.
             */
            this.modal = new (require('../modal/default').DefaultModal)();
        }
        else {
            this.modal = new events_1.default();
        }
        /**
         * Fido2 client session.
         */
        this.session = new session_1.Ctap2Session(this.options.pinUvAuthProtocol || environment_1.ClientPinVersion.v1);
        /**
         * Fido2 event emitter.
         */
        this.event = new events_1.default();
        /**
         * Create pin observable.
         */
        this.pin = rxjs_1.of(rxjs_1.fromEvent(this.event, symbol_1.Fido2EventPinAvailable, pin => pin), rxjs_1.fromEvent(this.modal, symbol_1.Fido2EventPinAvailable, pin => pin)).pipe(operators_1.mergeAll());
        /**
         * Create device observable.
         */
        this.device = rxjs_1.of(rxjs_1.fromEvent(this.event, symbol_1.Fido2EventSelectDevice, device => device), rxjs_1.fromEvent(this.modal, symbol_1.Fido2EventSelectDevice, device => device)).pipe(operators_1.mergeAll());
        /**
         * Create request observable.
         */
        this.request = rxjs_1.of(rxjs_1.fromEvent(this.event, symbol_1.Fido2EventResponse, (status) => status), rxjs_1.fromEvent(this.modal, symbol_1.Fido2EventResponse, (status) => status)).pipe(operators_1.mergeAll());
        /**
         * Create cancel observable.
         */
        this.cancel = rxjs_1.of(rxjs_1.fromEvent(this.event, symbol_1.Fido2EventCancel, () => void 0), rxjs_1.fromEvent(this.modal, symbol_1.Fido2EventCancel, () => void 0)).pipe(operators_1.mergeAll());
        /**
         * Subscription.
         */
        this.subs = new rxjs_1.Subscription();
        /**
         *
         */
        let event = this.options.event;
        if (event) {
            event.onRequest && this.event.on(symbol_1.Fido2EventRequest, async (request) => {
                let status = event?.onRequest && await event.onRequest(request);
                status !== undefined && this.event.emit(symbol_1.Fido2EventResponse, status);
            });
            event.onDeviceAttached && this.event.on(symbol_1.Fido2EventDeviceAttach, async (device) => {
                let select = event?.onDeviceAttached && await event.onDeviceAttached(device).catch(() => { });
                select && this.event.emit(symbol_1.Fido2EventSelectDevice, select);
            });
            event.onSetPin && this.event.on(symbol_1.Fido2EventSetPin, async () => {
                let pin = event?.onSetPin && await event.onSetPin();
                pin !== undefined && this.event.emit(symbol_1.Fido2EventPinAvailable, pin);
            });
            event.onEnterPin && this.event.on(symbol_1.Fido2EventEnterPin, async () => {
                let pin = event?.onEnterPin && await event.onEnterPin();
                pin !== undefined && this.event.emit(symbol_1.Fido2EventPinAvailable, pin);
            });
            event.onPinInvalid && this.event.on(symbol_1.Fido2EventPinInvalid, async (retries) => {
                let pin = event?.onPinInvalid && await event.onPinInvalid(retries);
                this.event.emit(symbol_1.Fido2EventPinAvailable, pin);
            });
            this.event.on(symbol_1.Fido2EventDeviceSelected, event.onDeviceSelected || (() => { }));
            this.event.on(symbol_1.Fido2EventPinValid, event.onPinValid || (() => { }));
            this.event.on(symbol_1.Fido2EventPinAuthBlocked, event.onPinAuthBlocked || (() => { }));
            this.event.on(symbol_1.Fido2EventPinBlocked, event.onPinBlocked || (() => { }));
            this.event.on(symbol_1.Fido2EventSuccess, event.onSuccess || (() => { }));
            this.event.on(symbol_1.Fido2EventKeepAlive, event.onKeepAlive || (() => { }));
            this.event.on(symbol_1.Fido2EventTimeout, event.onTimeout || (() => { }));
            this.event.on(symbol_1.Fido2EventError, event.onError || (() => { }));
        }
        debug_1.logger.debug('create fido2 client success');
    }
    get subscription() {
        if (this.subs.closed)
            this.subs = new rxjs_1.Subscription();
        return this.subs;
    }
    emit(event, arg) {
        if (this.event.eventNames().includes(event))
            return this.event.emit(event, arg);
        if (!this.options.defaultModal)
            throw new client_1.Fido2ClientErrMissingEventListener(event);
        return this.modal.emit(event, arg);
    }
    async makeExtensionsInput(input) {
        let exts = new Map();
        let info = await this.session.ctap2.info;
        if (input.appid) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.appidExclude) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.uvm) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.credProps) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.largeBlob) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.credentialProtectionPolicy) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.enforceCredentialProtectionPolicy) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.credBlob) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.getCredBlob) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.largeBlobKey) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.minPinLength) {
            throw new client_1.Fido2ClientErrExtensionNotImplemented();
        }
        if (input.hmacCreateSecret && info.extensions.includes(hmac_secret_1.HmacSecretExtIdentifier)) {
            exts.set(hmac_secret_1.HmacSecretExtIdentifier, await new hmac_secret_1.HmacSecretInput(this.session.ctap2.clientPin).make(input.hmacCreateSecret).build());
        }
        if (input.hmacGetSecret && info.extensions.includes(hmac_secret_1.HmacSecretExtIdentifier)) {
            exts.set(hmac_secret_1.HmacSecretExtIdentifier, await new hmac_secret_1.HmacSecretInput(this.session.ctap2.clientPin).get(input.hmacGetSecret.salt1, input.hmacGetSecret.salt2).build());
        }
        return exts.size ? exts : undefined;
    }
    async makeExtensionsOutput(output) {
        let exts = {};
        if (output === undefined) {
            return exts;
        }
        if (typeof output[hmac_secret_1.HmacSecretExtIdentifier] === 'boolean') {
            exts.hmacCreateSecret = (await new hmac_secret_1.HmacSecretOutput(this.session.ctap2.clientPin).make(output[hmac_secret_1.HmacSecretExtIdentifier]).build());
            delete output[hmac_secret_1.HmacSecretExtIdentifier];
        }
        if (output[hmac_secret_1.HmacSecretExtIdentifier] instanceof Buffer) {
            exts.hmacGetSecret = (await new hmac_secret_1.HmacSecretOutput(this.session.ctap2.clientPin).get(output[hmac_secret_1.HmacSecretExtIdentifier]).build());
            delete output[hmac_secret_1.HmacSecretExtIdentifier];
        }
        return exts;
    }
    internalGetPinUvAuthToken(uv, clientPin, pinUvAuthToken, version) {
        return new Promise((resolve, reject) => {
            /**
            * @deprecated in CTAP 2.1 specs
            */
            if (uv && !pinUvAuthToken) {
                if (!(version && version.includes(environment_1.Fido2SpecVersion.v20)))
                    throw new client_1.Fido2ClientErrMethodDeprecated();
                return resolve(undefined);
            }
            /**
             * Get pinUvAuthToken using getPinUvAuthTokenUsingUvWithPermissions
             */
            if (uv && pinUvAuthToken) {
                /**
                 * @TODO
                */
                throw new common_1.MethodNotImplemented();
            }
            /**
             * Get pinUvAuthToken using getPinUvAuthTokenUsingPinWithPermissions
             */
            if (clientPin && pinUvAuthToken) {
                /**
                 * @TODO
                 */
                throw new common_1.MethodNotImplemented();
            }
            /**
             * @superseded
             */
            if (clientPin) {
                this.subscription.add(this.pin.subscribe(pin => this.session.ctap2.clientPin.getPinToken(pin).then(pinUvAuthToken => {
                    this.emit(symbol_1.Fido2EventPinValid);
                    resolve(pinUvAuthToken);
                }).catch(async (e) => {
                    if (e instanceof ctap2_1.Ctap2ErrPinInvalid)
                        return this.emit(symbol_1.Fido2EventPinInvalid, await this.session.ctap2.clientPin.getPinRetries());
                    if (e instanceof ctap2_1.Ctap2ErrPinAuthBlocked)
                        return this.emit(symbol_1.Fido2EventPinAuthBlocked);
                    if (e instanceof ctap2_1.Ctap2ErrPinBlocked)
                        return this.emit(symbol_1.Fido2EventPinBlocked);
                    reject(e);
                })));
                this.emit(symbol_1.Fido2EventEnterPin);
                return;
            }
            /**
             * Unreachable
             */
            reject(new client_1.Fido2ClientErrUserVerificationNotCapable());
        });
    }
    getPinUvAuthToken(userVerification) {
        return new Promise(async (resolve, reject) => {
            this.subscription.add(this.device.pipe(operators_1.first()).subscribe(async (device) => {
                /**
                 * Open selected authenticator and perform get authenticator info request.
                 */
                this.session.device.open(device);
                let info = await this.session.ctap2.info;
                /**
                 * Set maxMsgSize for device cli.
                 */
                (await this.session.device.console).setMaxMsgSize(info.maxMsgSize || 1024);
                debug_1.logger.debug(info);
                /**
                 * Emit selected authenticator info event.
                 */
                this.emit(symbol_1.Fido2EventDeviceSelected, {
                    uv: info.options.uv,
                    clientPin: info.options.clientPin,
                    pinRetries: (info.options.clientPin && !info.options.uv) ? await this.session.ctap2.clientPin.getPinRetries() : 0
                });
                /**
                 * Check pin/uv auth protocol compatible.
                 */
                if (this.options.pinUvAuthProtocol && !info.pinUvAuthProtocols.includes(this.options.pinUvAuthProtocol))
                    throw new client_1.Fido2ClientErrPinUvAuthProtocolUnsupported();
                let { uv, clientPin, pinUvAuthToken } = info.options;
                /**
                 * Built-in user verification method. For example, devices with screen, biometrics, ...
                 * TODO: high priority for built-in user verification method (not specified in the v2.1 specs).
                 */
                if (uv !== undefined) {
                    debug_1.logger.debug('built-in user verification');
                    /**
                     * Built-in user verification not configured and relying party don't care about user verification.
                     */
                    if (!uv && userVerification === 'discouraged')
                        return resolve({ userVerification: false, pinUvAuthToken: undefined });
                    /**
                     * Built-in user verification has been configured.
                     * let user to configure built-in user verification.
                     */
                    if (uv)
                        return this.internalGetPinUvAuthToken(uv, clientPin, pinUvAuthToken, info.version).then(token => {
                            if (uv)
                                resolve({ userVerification: token === undefined, pinUvAuthToken: token });
                        });
                    if (!uv) {
                        /**
                         * @TODO implement built-in user verification configure.
                         */
                        // throw new MethodNotImplemented();
                    }
                    /**
                     * Fall back to client pin.
                     */
                }
                if (clientPin !== undefined) {
                    debug_1.logger.debug('client-pin user verification');
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
                        this.subscription.add(this.pin.pipe(operators_1.first()).subscribe(async (pin) => {
                            await this.session.ctap2.clientPin.setPin(pin);
                            /**
                             * @TODO verify that the PIN has been configured.
                             */
                            this.internalGetPinUvAuthToken(uv, true, pinUvAuthToken).then(token => {
                                resolve({ userVerification: false, pinUvAuthToken: token });
                            });
                        }));
                        this.emit(symbol_1.Fido2EventEnterPin);
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
                throw new client_1.Fido2ClientErrUserVerificationNotCapable();
            }));
            /**
             * Subscribe for device attach.
             */
            this.subscription.add((await this.session.device.enumerate(this.options.transports)).pipe(operators_1.takeUntil(this.device)).subscribe(device => {
                debug_1.logger.debug(device);
                this.emit(symbol_1.Fido2EventDeviceAttach, device);
            }));
        });
    }
    makeClientRequest(rp) {
        let { signer, verified } = bindings_1.verify(process.execPath);
        return {
            publisher: signer,
            process: path_1.default.basename(process.execPath),
            rp: rp,
            trusted: verified
        };
    }
    /**
     *
     * @param origin
     * @param options
     * @returns
     */
    async makeCredential(origin, options) {
        return await new Promise(async (resolve, reject) => {
            let pub = options.publicKey;
            /**
             * Validate required parameters.
             */
            if (pub.rp === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('rp'));
            if (pub.rp.name === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('rp.name'));
            if (pub.user.name === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('user.name'));
            if (pub.user.displayName === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('user.displayName'));
            /**
             * @TODO
             * Force required icon.
             */
            if (pub.user.icon === undefined)
                pub.user.icon = `${pub.user.name}.ico`;
            if (pub.user.id === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('user.id'));
            if (pub.challenge === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('challenge'));
            if (pub.pubKeyCredParams === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('pubKeyCredParams'));
            /**
             * Validate required parameters type.
             */
            if (typeof pub.rp.name !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('rp.name'));
            /**
             * @TODO
             * Fore rpId to origin.
             */
            if (typeof pub.rp.id !== 'string')
                pub.rp.id = new URL(origin).origin;
            if (typeof pub.user.name !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('user.name'));
            if (typeof pub.user.displayName !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('user.displayName'));
            if (typeof pub.user.icon !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('user.icon'));
            if (ArrayBuffer.isView(pub.user.id) === false && (pub.user.id instanceof ArrayBuffer) === false)
                return reject(new client_1.Fido2ClientErrInvalidParameter('user.id'));
            if (ArrayBuffer.isView(pub.challenge) === false && (pub.challenge instanceof ArrayBuffer) === false)
                return reject(new client_1.Fido2ClientErrInvalidParameter('challenge'));
            if ((pub.pubKeyCredParams instanceof Array) === false)
                return reject(new client_1.Fido2ClientErrInvalidParameter('pubKeyCredParams'));
            if (!pub.pubKeyCredParams.every(x => x.alg in WrapCOSEAlgorithmIdentifier_1.WrapCOSEAlgorithmIdentifier && x.type in WrapPublicKeyCredentialType_1.WrapPublicKeyCredentialType))
                return reject(new client_1.Fido2ClientErrInvalidParameter('pubKeyCredParams'));
            /**
             * Validate optional parameters.
             */
            if (pub.timeout && isNaN(pub.timeout))
                return reject(new client_1.Fido2ClientErrInvalidParameter('timeout'));
            // TODO: check exclude credential element type
            if (pub.excludeCredentials && pub.excludeCredentials instanceof Array === false)
                return reject(new client_1.Fido2ClientErrInvalidParameter('excludeCredentials'));
            if (pub.authenticatorSelection?.authenticatorAttachment && typeof pub.authenticatorSelection.authenticatorAttachment !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('authenticatorSelection.authenticatorAttachment'));
            if (pub.authenticatorSelection?.residentKey && typeof pub.authenticatorSelection?.residentKey !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('authenticatorSelection.residentKey'));
            if (pub.authenticatorSelection?.requireResidentKey && typeof pub.authenticatorSelection?.requireResidentKey !== 'boolean')
                return reject(new client_1.Fido2ClientErrInvalidParameter('authenticatorSelection.requireResidentKey'));
            if (pub.authenticatorSelection?.userVerification && typeof pub.authenticatorSelection?.userVerification !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('authenticatorSelection.userVerification'));
            if (pub.attestation && typeof pub.attestation !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('attestation'));
            // if (new URL(origin).origin !== origin) throw new Fido2ClientErrRelyPartyNotAllowed();
            debug_1.logger.debug('before request');
            let timer = setTimeout(() => {
                reject(new client_1.Fido2ClientErrTimeout());
            }, pub.timeout || (pub.authenticatorSelection?.userVerification === 'discouraged' ? 12000 : 300000));
            /**
             * Waiting for make credential request.
             */
            this.request.pipe(operators_1.first()).subscribe(async (status) => {
                /**
                 * Request deny
                 */
                if (!status)
                    return reject(new client_1.Fido2ClientErrNotAllowed());
                /**
                 * Subscribe for cancel event.
                 */
                this.cancel.pipe(operators_1.first()).subscribe(async () => {
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
                    reject(new client_1.Fido2ClientErrCancel());
                });
                /**
                 * Migrate types.
                 */
                Object.assign(pub, { challenge: Buffer.from(pub.challenge) });
                Object.assign(pub.user, { id: Buffer.from(pub.user.id) });
                pub.excludeCredentials && pub.excludeCredentials.map(x => Object.assign(x, { id: Buffer.from(x.id) }));
                let userVerification = pub.authenticatorSelection?.userVerification || 'required';
                let discoverableCredential = pub.authenticatorSelection?.residentKey || 'discouraged';
                if (pub.authenticatorSelection?.requireResidentKey)
                    discoverableCredential = 'required';
                let tup = await this.getPinUvAuthToken(userVerification);
                this.session.clientData = {
                    type: 'webauthn.create',
                    challenge: base64_1.Base64.encode(Buffer.from(pub.challenge)),
                    origin: new URL(origin).origin
                };
                let clientData = Buffer.from(JSON.stringify(this.session.clientData));
                this.session.clientDataHash = crypto_1.Fido2Crypto.hash(clientData);
                /**
                 * Create make credential options.
                 */
                let opt = {};
                if (discoverableCredential === 'required')
                    opt.rk = true;
                if (tup.userVerification)
                    opt.uv = true;
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
                    pinUvAuthParam: tup.pinUvAuthToken ? crypto_1.Fido2Crypto.hmac(tup.pinUvAuthToken, this.session.clientDataHash).slice(0, 16) : undefined,
                    pinUvAuthProtocol: this.options.pinUvAuthProtocol,
                }, (status) => {
                    this.emit(symbol_1.Fido2EventKeepAlive, status);
                }).then(async (credential) => {
                    /**
                     * Make credential request almost done.
                     */
                    this.emit(symbol_1.Fido2EventSuccess);
                    /**
                     * Parse authenticator data.
                     */
                    let authData = new make_credential_1.AuthenticatorData(credential.authData);
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
                        id: base64_1.Base64.encode(authData.attestedCredentialData?.credentialId),
                        rawId: authData.attestedCredentialData?.credentialId.buffer.slice(authData.attestedCredentialData?.credentialId.byteOffset, authData.attestedCredentialData?.credentialId.byteOffset + authData.attestedCredentialData?.credentialId.byteLength),
                        type: 'public-key',
                        response: new WrapAuthenticatorAttestationResponse_1.WrapAuthenticatorAttestationResponse(credential, clientData),
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
                    debug_1.logger.debug(e);
                    if (e instanceof ctap2_1.Ctap2ErrActionTimeout)
                        this.emit(symbol_1.Fido2EventTimeout);
                    reject(e);
                });
            });
            /**
             * Start make credential request.
             */
            this.emit(symbol_1.Fido2EventRequest, this.makeClientRequest(pub.rp.id));
        });
    }
    /**
     *
     * @param origin
     * @param options
     * @returns
     */
    async getAssertion(origin, options) {
        return await new Promise(async (resolve, reject) => {
            let pub = options.publicKey;
            /**
             * Validate required parameters.
             */
            if (pub.challenge === undefined)
                return reject(new client_1.Fido2ClientErrMissingParameter('challenge'));
            /**
             * Validate required parameters type.
             */
            if (ArrayBuffer.isView(pub.challenge) === false && (pub.challenge instanceof ArrayBuffer) === false)
                return reject(new client_1.Fido2ClientErrMissingParameter('challenge'));
            /**
             * Validate optional parameters.
             */
            if (pub.timeout && isNaN(pub.timeout))
                return reject(new client_1.Fido2ClientErrInvalidParameter('timeout'));
            if (pub.rpId && typeof pub.rpId !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('rpId'));
            if (pub.allowCredentials && pub.allowCredentials instanceof Array === false)
                return reject(new client_1.Fido2ClientErrInvalidParameter('allowCredentials'));
            if (pub.allowCredentials && !pub.allowCredentials.every(x => (ArrayBuffer.isView(x.id) || x.id instanceof ArrayBuffer) && x.type in WrapPublicKeyCredentialType_1.WrapPublicKeyCredentialType))
                return reject(new client_1.Fido2ClientErrInvalidParameter('allowCredentials'));
            if (pub.userVerification && typeof pub.userVerification !== 'string')
                return reject(new client_1.Fido2ClientErrInvalidParameter('userVerification'));
            if (new URL(origin).hostname !== pub.rpId)
                return reject(new client_1.Fido2ClientErrRelyPartyNotAllowed());
            debug_1.logger.debug('before request');
            let timer = setTimeout(() => {
                reject(new client_1.Fido2ClientErrTimeout());
            }, pub.timeout || (pub.userVerification === 'discouraged' ? 12000 : 300000));
            /**
             * Waiting for get assertion request.
             */
            this.request.pipe(operators_1.first()).subscribe(async (status) => {
                /**
                 * Request deny.
                 */
                if (!status)
                    return reject(new client_1.Fido2ClientErrNotAllowed());
                /**
                 * Subscribe for cancel event.
                 */
                this.cancel.pipe(operators_1.first()).subscribe(async () => {
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
                    reject(new client_1.Fido2ClientErrCancel());
                });
                /**
                 * Migrate type.
                 */
                Object.assign(pub, { challenge: Buffer.from(pub.challenge) });
                pub.allowCredentials && pub.allowCredentials.map(x => Object.assign(x, { id: Buffer.from(x.id) }));
                let userVerification = pub.userVerification || 'required';
                let discoverableCredential = pub.allowCredentials === undefined ? 'required' : 'discouraged';
                let tup = await this.getPinUvAuthToken(userVerification);
                this.session.clientData = {
                    type: 'webauthn.get',
                    challenge: base64_1.Base64.encode(Buffer.from(pub.challenge)),
                    origin: new URL(origin).origin
                };
                let clientData = Buffer.from(JSON.stringify(this.session.clientData));
                this.session.clientDataHash = crypto_1.Fido2Crypto.hash(clientData);
                /**
                 * Create get assertion options.
                 */
                let opt = {};
                if (discoverableCredential === 'required')
                    opt.rk = true;
                if (tup.userVerification)
                    opt.uv = true;
                /**
                 * Get assertion.
                 */
                this.session.ctap2.getAssertion({
                    rpId: pub.rpId || new URL(origin).hostname,
                    clientDataHash: this.session.clientDataHash,
                    allowList: pub.allowCredentials,
                    extensions: pub.extensions ? await this.makeExtensionsInput(pub.extensions) : undefined,
                    options: opt,
                    pinUvAuthParam: tup.pinUvAuthToken ? crypto_1.Fido2Crypto.hmac(tup.pinUvAuthToken, this.session.clientDataHash).slice(0, 16) : undefined,
                    pinUvAuthProtocol: this.options.pinUvAuthProtocol
                }, status => {
                    this.emit(symbol_1.Fido2EventKeepAlive, status);
                }).then(async (credentials) => {
                    /**
                     * Get assertion request almost done.
                     */
                    this.emit(symbol_1.Fido2EventSuccess);
                    /**
                     * @TODO select credential.
                     */
                    let credential = credentials[0];
                    /**
                     * Parse authenticator data.
                     */
                    let authData = new make_credential_1.AuthenticatorData(credential.authData);
                    let extensions = await this.makeExtensionsOutput(authData.extensions);
                    let id = credential.credential.id;
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
                        id: base64_1.Base64.encode(id),
                        rawId: id.buffer.slice(id.byteOffset, id.byteOffset + id.byteLength),
                        type: 'public-key',
                        response: {
                            clientDataJSON: clientData.buffer.slice(clientData.byteOffset, clientData.byteOffset + clientData.byteLength),
                            authenticatorData: credential.authData.buffer.slice(credential.authData.byteOffset, credential.authData.byteOffset + credential.authData.byteLength),
                            signature: credential.signature.buffer.slice(credential.signature.byteOffset, credential.signature.byteOffset + credential.signature.byteLength),
                            userHandle: userHandle && userHandle instanceof Buffer && userHandle.buffer.slice(userHandle.byteOffset, userHandle.byteOffset + userHandle.byteLength)
                        },
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
            this.emit(symbol_1.Fido2EventRequest, this.makeClientRequest(pub.rpId));
        });
    }
    async release() {
        this.event.removeAllListeners();
        this.modal.removeAllListeners();
        this.session.device.release();
        this.session.revoke();
        this.subscription.unsubscribe();
    }
}
exports.Fido2Client = Fido2Client;
