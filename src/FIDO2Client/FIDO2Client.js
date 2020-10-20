let Promise = require('bluebird');
let {Device, GetFIDO2Devices} = require('../Transports/USB');
let {CTAP2, ClientPin} = require('../CTAP2/CTAP2');
let {PIN_PROTOCOL_VERSION} = require('../CTAP2/Constants');
let {EventEmitter} = require('events');
let crypto = require('../Utils/CryptoUtils');
const {CTAP2ErrorActionTimeout} = require("../CTAP2/Errors");
const {FIDO2ClientMissingEventListener} = require("./Errors");
const {CTAP2ErrorPINRequired} = require("../CTAP2/Errors");
const {FIDO2ClientErrorDeviceNotFound} = require("./Errors");
const {CTAP2KeepAliveCancel} = require("../CTAP2/Errors");
let {CTAP2ErrorPINBlocked} = require("../CTAP2/Errors");
let {MakeCredential, GetAssertion, InfoResp} = require('../CTAP2/Models');
let {REPLAY, EVENT, EVENT_REPLAY, CLIENT_TYPE} = require('./Constants');
let {
    CollectedClientData,
    PublicKeyCredentialAttestation,
    PublicKeyCredentialAssertion,
    PublicKeyCredentialCreationOptions,
    PublicKeyCredentialRequestOptions,
    AuthenticatorSelectionCriteria
} = require('../Webauthn/Models');
let {UserVerificationRequirement} = require('../Webauthn/Contants');
const {CTAP2ErrorPINAuthBlocked} = require("../CTAP2/Errors");
const {CTAP2Error} = require("../CTAP2/Errors");
const {CTAP2ErrorNoCredentials} = require("../CTAP2/Errors");
const {CTAP2ErrorPINInvalid} = require('../CTAP2/Errors');


/**
 * Extends from Nodejs built-in class EventEmitter, add reply() method
 */
class KEventEmitter extends EventEmitter {

    constructor(props) {
        super(props);
        this.channel = undefined;
    }

    reply = (...args) => {

        if (this.channel) this.emit(this.channel, ...args);
    }
}

class FIDO2Client {

    /**
     *
     * @param useDefaultModal {boolean}
     * @constructor
     */
    constructor(useDefaultModal = true) {

        /**
         * Current origin.
         * @type {URL}
         */
        this.rp = undefined;
        /**
         * Custom event emitter.
         * @type {KEventEmitter}
         */
        this.event = new KEventEmitter();
        /**
         * Authenticator info.
         * @type {InfoResp}
         */
        this.info = undefined;
        /**
         * @type {Modal}
         */
        this.modal = useDefaultModal ? require('../Modals/Modal').modal : undefined;
    }


    /**
     * Perform a test of user presence (TUP). Resolve an object contain {uv, pinToken}.
     * @param options {AuthenticatorSelectionCriteria}
     * @returns {Promise<{uv: boolean, pinToken: Buffer}>}
     */
    testUserPresence = (options) => new Promise((resolve, reject) => {

        /**
         * Get all FIDO2 device.
         */
        let devices = GetFIDO2Devices();
        if (devices.length === 0) return reject(new FIDO2ClientErrorDeviceNotFound());
        if (devices.length === 1) return resolve(devices[0]);

        /**
         * More than 1 FIDO2 device.
         */
        if (this.event.eventNames().includes(EVENT.SELECT_DEVICE)) {
            this.event.once(EVENT_REPLAY.SELECT_DEVICE, (device) => {
                resolve(device);
            });
            this.emit(EVENT.SELECT_DEVICE, devices);
        } else if (this.modal) {
            this.modal.selectDevice(devices).then((index) => {
                resolve(devices[index]);
            });
        } else {
            reject(new FIDO2ClientMissingEventListener(EVENT.SELECT_DEVICE));
        }

    }).then((device) => {
        /**
         * Open and init HID device.
         */
        return (new Device(device, 64)).initDevice();
    }).then((deviceHandle) => {
        /**
         * Init CTAP2 device and get info.
         * @type {CTAP2}
         */
        this.ctap2 = new CTAP2(deviceHandle);
        // this.ctap2.reset();
        return this.ctap2.authenticatorGetInfo();
    }).then((info) => {
        /**
         * Check if PIN protocol supported.
         */
        this.info = info;
        this.clientPin = (info.pinProtocols && info.pinProtocols.includes(PIN_PROTOCOL_VERSION)) ? new ClientPin(this.ctap2) : undefined;
    }).then(() => new Promise((resolve, reject) => {

        let pinSupported = this.info.options.hasOwnProperty('clientPin');
        let pinSet = this.info.options.clientPin;

        if (!pinSupported) {

            let uvSupported = this.info.options.hasOwnProperty('uv');
            let uvSet = this.info.options.uv;

            if (options.userVerification === UserVerificationRequirement.REQUIRED) {
                if (!uvSet) throw Error('User verification not configured/supported.');
                return resolve({uv: true});
            }

            if (options.userVerification === UserVerificationRequirement.PREFERRED) {
                if (!uvSet && uvSupported) throw Error('User verification supported but not configured.');
                return resolve({uv: true});
            }

            return resolve({uv: false});
        }

        /**
         * PIN required but PIN not set yet.
         */
        if (!pinSet && (options.userVerification === UserVerificationRequirement.REQUIRED || options.requireResidentKey)) {

            /**
             * Set new PIN (required event).
             */
            this.event.once(EVENT_REPLAY.SET_NEW_PIN, (pin) => {
                /**
                 * Set new PIN.
                 */
                this.clientPin.setPin(pin).then(() => {
                    return this.clientPin.getPinToken(pin);
                }).then((pinToken) => {
                    resolve({uv: true, pinToken});
                }).catch((e) => {
                    reject(e);
                });
            });
            this.emit(EVENT.SET_NEW_PIN);

            if (!this.event.eventNames().includes(EVENT.SET_NEW_PIN)) {

                /**
                 * Default set PIN modal.
                 */
                if (!this.modal) return reject(new FIDO2ClientMissingEventListener(EVENT.SET_NEW_PIN));
                this.modal.newPIN().then(this.reply).catch(() => {
                    this.ctap2.cancel();
                    reject(new CTAP2KeepAliveCancel());
                });
            }
        } else if (!pinSet &&
            (options.userVerification === UserVerificationRequirement.PREFERRED ||
                options.userVerification === UserVerificationRequirement.DISCOURAGED)) {
            /**
             * PIN is not set and rely party doesn't need PIN.
             */
            resolve({uv: true});
        } else if (pinSet) {

            /**
             * PIN is set.
             */
            if (this.event.eventNames().includes(EVENT.ENTER_PIN)) {
                /**
                 * Handle enter PIN by user.
                 */
                this.event.on(EVENT_REPLAY.ENTER_PIN, (pin) => {
                    this.clientPin.getPinRetries().then((rsp) => {
                        /**
                         * Get and check PIN retries.
                         */
                        if (rsp.pinRetries) return this.clientPin.getPinToken(pin).then((pinToken) => {
                            /**
                             * Get pinToken success.
                             */
                            this.event.removeAllListeners(EVENT_REPLAY.ENTER_PIN);
                            resolve({uv: true, pinToken});
                        }).catch(CTAP2ErrorPINInvalid, () => {
                            /**
                             * Invalid PIN.
                             */
                            this.emit(EVENT.INVALID_PIN, rsp.pinRetries - 1);
                        }).catch(CTAP2ErrorPINAuthBlocked, (e) => {
                            /**
                             * PIN auth blocked (current boot session).
                             */
                            this.emit(EVENT.PIN_AUTH_BLOCKED);
                            this.event.removeAllListeners(EVENT_REPLAY.ENTER_PIN);
                            reject(e);
                        }).catch(CTAP2ErrorPINBlocked, (e) => {
                            /**
                             * PIN blocked (all retries per boot is consumed).
                             */
                            this.emit(EVENT.PIN_BLOCKED);
                            this.event.removeAllListeners(EVENT_REPLAY.ENTER_PIN);
                            reject(e);
                        });

                        /**
                         * PIN blocked (all retries per boot is consumed).
                         */
                        this.emit(EVENT.PIN_BLOCKED);
                        this.event.removeAllListeners(EVENT_REPLAY.ENTER_PIN);
                        reject()
                    });
                });

                /**
                 * Emit event.
                 */
                this.emit(EVENT.ENTER_PIN);

            } else {

                /**
                 * Handle default enter PIN modal.
                 */
                if (!this.modal) return reject(new FIDO2ClientMissingEventListener(EVENT.ENTER_PIN));
                this.modal.on(EVENT.ENTER_PIN, (pin) => {
                    this.clientPin.getPinRetries().then((rsp) => {
                        /**
                         * Get and check PIN retries.
                         */
                        if (rsp.pinRetries) return this.clientPin.getPinToken(pin).then((pinToken) => {
                            /**
                             * Get pinToken success.
                             */
                            this.modal.removeAllListeners(EVENT.ENTER_PIN);
                            resolve({uv: true, pinToken});
                        }).catch(CTAP2ErrorPINInvalid, (e) => {
                            /**
                             * Invalid PIN.
                             */
                            console.log(e, 1337);
                            this.modal.invalidPIN(rsp.pinRetries - 1);
                        }).catch(CTAP2ErrorPINAuthBlocked, (e) => {
                            /**
                             * PIN auth blocked (current boot session).
                             */
                            this.modal.pinAuthLocked();
                            this.modal.removeAllListeners(EVENT.ENTER_PIN);
                            reject(e);
                        }).catch(CTAP2ErrorPINBlocked, (e) => {
                            /**
                             * PIN blocked (all retries per boot is consumed).
                             */
                            this.modal.pinLocked();
                            this.modal.removeAllListeners(EVENT.ENTER_PIN);
                            reject(e);
                        });

                        /**
                         * PIN blocked (all retries per boot is consumed).
                         */
                        this.modal.pinLocked();
                        this.modal.removeAllListeners(EVENT.ENTER_PIN);
                        reject()
                    });
                });

                /**
                 * Emit default enter PIN modal.
                 */
                this.clientPin.getPinRetries().then((rsp) => {
                    /**
                     * Check if PIN blocked.
                     */
                    if (!rsp.pinRetries) {
                        /**
                         * PIN blocked.
                         */
                        this.modal.pinLocked();
                        reject(new CTAP2ErrorPINBlocked());
                        return;
                    }
                    /**
                     * Show default enter PIN modal.
                     */
                    this.modal.enterPIN().catch(() => {
                        this.ctap2.cancel();
                        this.modal.removeAllListeners(EVENT.ENTER_PIN);
                        reject(new CTAP2KeepAliveCancel());
                    });
                });
            }
        }
    }));


    /**
     * Make credential request.
     * @param options {Object}
     * @param origin {string}
     * @param onKeepAlive {function}
     * @returns {PromiseLike<PublicKeyCredentialAttestation> | Promise<PublicKeyCredentialAttestation>}
     */
    makeCredential = (options, origin, onKeepAlive = undefined) => {

        this.rp = new URL(origin);
        let createOptions = new PublicKeyCredentialCreationOptions(options.publicKey),
            clientData = new CollectedClientData(CLIENT_TYPE.CREATE, this.rp.origin, createOptions.challenge),
            clientDataHash = crypto.SHA256(clientData.toJson()),
            opt = new Map();

        if (createOptions.rp.id && createOptions.rp.id !== this.rp.hostname) return Promise.reject(new Error('Origin not matched'));
        createOptions.rp.id = createOptions.rp.id ? createOptions.rp.id : this.rp.hostname;
        createOptions.authenticatorSelection.requireResidentKey && opt.set('rk', true);

        return this.testUserPresence(createOptions.authenticatorSelection).then((data) => {

            let uv = data.uv,
                pinToken = data.pinToken;

            if (this.info.options.authenticatorClientPIN && !uv) throw new CTAP2ErrorPINRequired();

            /**
             * Check if user handled PIN valid event (optional event).
             */
            if (this.event.eventNames().includes(EVENT.VALID_PIN)) {
                this.emit(EVENT.VALID_PIN);
            } else {
                /**
                 * Default handle.
                 */
                if (this.info.options.authenticatorClientPIN && createOptions.authenticatorSelection.requireResidentKey) {
                    this.modal && this.modal.validPINMakeResidentKey(this.rp.origin);
                } else {
                    this.modal && this.modal.validPIN(this.rp.origin);
                }
            }

            uv && opt.set('uv', true);
            let pinAuth = pinToken ? crypto.HMACSHA256(pinToken, clientDataHash).slice(0, 16) : undefined;
            let excludeList = (this.info.maxCredLen ? createOptions.excludeList.filter(cred => cred.id.length <= this.info.maxCredLen) : createOptions.excludeList).flatMap(cred => cred.toMap());

            return this.ctap2.authenticatorMakeCredential(new MakeCredential(
                clientDataHash,
                createOptions.rp.toMap(),
                createOptions.user.toMap(),
                createOptions.credParams.flatMap(param => param.toMap()),
                excludeList,
                createOptions.extensions,
                opt,
                pinAuth,
                PIN_PROTOCOL_VERSION), onKeepAlive
            );
        }).then((attestation) => {
            /**
             * Make credential success (optional event).
             */
            if (this.event.eventNames().includes(EVENT.SUCCESS)) {
                this.emit(EVENT.SUCCESS);
            } else {
                this.modal && this.modal.success();
            }
            return new PublicKeyCredentialAttestation(clientData.toJson(), attestation);
        }).catch(FIDO2ClientErrorDeviceNotFound, (e) => {
            /**
             * FIDO2 device not found (optional event).
             */
            if (this.event.eventNames().includes(EVENT.FIDO2_DEVICE_NOT_FOUND)) {
                this.emit(EVENT.FIDO2_DEVICE_NOT_FOUND);
            } else {
                this.modal && this.modal.deviceNotFound();
            }
            return Promise.reject(e);
        }).catch(CTAP2ErrorActionTimeout, (e) => {
            /**
             * Action timeout (optional event).
             */
            if (this.event.eventNames().includes(EVENT.ACTION_TIMEOUT)) {
                this.emit(EVENT.ACTION_TIMEOUT);
            } else {
                this.modal && this.modal.actionTimeout();
            }
            return Promise.reject(e);
        }).catch(CTAP2ErrorPINAuthBlocked, CTAP2ErrorPINBlocked, CTAP2ErrorPINRequired, (e) => {
            /**
             * Reply PIN locked even to modal.
             */
            this.ctap2.closeDevice();
            return Promise.reject(e);
        }).catch(CTAP2Error, (e) => {
            /**
             * Others CTAP2 error.
             */
            console.log(e);
            this.ctap2.closeDevice();
            return Promise.reject(e);
        });
    };

    /**
     *
     * @param options {Object}
     * @param origin {string}
     * @param onKeepAlive {function}
     * @returns {PromiseLike<PublicKeyCredentialAssertion> | Promise<PublicKeyCredentialAssertion>}
     */
    getAssertion = (options, origin, onKeepAlive = undefined) => {

        this.rp = new URL(origin);
        let getOptions = new PublicKeyCredentialRequestOptions(options.publicKey);
        let clientData = new CollectedClientData(CLIENT_TYPE.GET, this.rp.origin, getOptions.challenge);

        /**
         * Test for user presence.
         */
        return this.testUserPresence(new AuthenticatorSelectionCriteria(
            undefined,
            getOptions.allowList.length === 0,
            getOptions.uv)
        ).then(async (data) => {

            let uv = data.uv,
                pinToken = data.pinToken;

            if (this.info.options.authenticatorClientPIN && !uv) return Promise.reject(new CTAP2ErrorPINRequired());
            if (uv) this.modal && this.modal.validPIN(this.rp.origin);

            let clientDataHash = crypto.SHA256(clientData.toJson());
            let allowList = (this.info.maxCredLen ? getOptions.allowList.filter(cred => cred.id.byteLength <= this.info.maxCredLen) : getOptions.allowList).flatMap(cred => cred.toMap());
            let options = new Map();

            uv && options.set('uv', true);
            let pinAuth = pinToken ? crypto.HMACSHA256(pinToken, clientDataHash).slice(0, 16) : undefined;

            return this.ctap2.authenticatorGetAssertion(new GetAssertion(
                getOptions.rpID ? getOptions.rpID : this.rp.hostname,
                clientDataHash,
                allowList,
                getOptions.extensions,
                options,
                pinAuth,
                PIN_PROTOCOL_VERSION), onKeepAlive
            );
        }).then((credentialInfo) => {

            if (credentialInfo.length === 1) {
                /**
                 * Found credential (optional event).
                 */
                if (this.event.eventNames().includes(EVENT.FOUND_CREDENTIAL)) {
                    this.emit(EVENT.FOUND_CREDENTIAL);
                } else {
                    this.modal && this.modal.success();
                }
                return new PublicKeyCredentialAssertion(clientData.toJson(), credentialInfo[0]);
            }
            if (credentialInfo.length > 1) {
                /**
                 * Residents key mode.
                 */
                return new Promise((resolve, reject) => {
                    this.event.once(EVENT_REPLAY.RESIDENT_KEY, (index) => {
                        resolve(new PublicKeyCredentialAssertion(clientData.toJson(), credentialInfo[index]));
                    });
                    this.emit(EVENT.RESIDENT_KEY, credentialInfo);
                    /**
                     * Emit default resident key modal if not handled by DEV.
                     */
                    if (this.event.eventNames().includes(EVENT.RESIDENT_KEY)) {
                    } else {
                        /**
                         * Default resident key modal.
                         */
                        if (!this.modal) return reject(new FIDO2ClientMissingEventListener(EVENT.RESIDENT_KEY));
                        this.modal.selectResidentKey(credentialInfo, this.rp.origin).then(this.reply).catch(() => {
                            this.ctap2.cancel();
                            reject(new CTAP2KeepAliveCancel());
                        });
                    }
                });
            }
        }).catch(FIDO2ClientErrorDeviceNotFound, (e) => {
            /**
             * FIDO2 device not found (optional event).
             */
            if (this.event.eventNames().includes(EVENT.FIDO2_DEVICE_NOT_FOUND)) {
                this.emit(EVENT.FIDO2_DEVICE_NOT_FOUND);
            } else {
                this.modal && this.modal.deviceNotFound();
            }
            return Promise.reject(e);
        }).catch(CTAP2ErrorActionTimeout, (e) => {
            /**
             * Action timeout (optional event).
             */
            if (this.event.eventNames().includes(EVENT.ACTION_TIMEOUT)) {
                this.emit(EVENT.ACTION_TIMEOUT);
            } else {
                this.modal && this.modal.actionTimeout();
            }
            return Promise.reject(e);
        }).catch(CTAP2ErrorNoCredentials, (e) => {
            /**
             * Reply no credentials event to modal (optional event).
             */
            if (this.event.eventNames().includes(EVENT.NO_CREDENTIALS)) {
                this.emit(EVENT.NO_CREDENTIALS);
            } else {
                this.modal && this.modal.noCredentials();
            }
            return Promise.reject(e);
        }).catch(CTAP2ErrorPINAuthBlocked, CTAP2ErrorPINBlocked,
            CTAP2ErrorNoCredentials, CTAP2ErrorPINRequired, (e) => {
                /**
                 * Need to close FIDO2 device.
                 */
                this.ctap2.closeDevice();
                return Promise.reject(e);
            }).catch(CTAP2Error, (e) => {
            /**
             * Others CTAP2 error.
             */
            console.log(e);
            this.ctap2.closeDevice();
            return Promise.reject(e);
        });
    };

    /**
     * Wrap on Nodejs built-in class EventEmitter.
     * @param eventName
     * @param listener
     */
    on = (eventName, listener) => {
        this.event.on(eventName, listener)
    };

    /**
     * Wrap on Nodejs built-in class EventEmitter.
     * @param eventName
     * @param listener
     */
    once = (eventName, listener) => {
        this.event.once(eventName, listener)
    };

    /**
     * Save current channel and emit.
     * @param eventName
     * @param args
     */
    emit = (eventName, ...args) => {
        this.event.channel = `${eventName}-${REPLAY}`;
        this.event.emit(eventName, ...args)
    };

    /**
     * Reply return value from listener
     * @param args
     */
    reply = (...args) => {
        this.event.reply(...args)
    };
}

// /**
//  *
//  * @param {Electron.BrowserWindow} win
//  * @param {boolean} force
//  * @constructor
//  */
// module.exports.InstallFIDO2Client = (win, force = false) => {
//
//     if (process.platform === 'win32' && !force) return;
//     win.webContents.on("did-finish-load", () => {
//         win.webContents.executeJavaScript(fs.readFileSync('./proxy.js', {encoding: 'utf-8'})).then(() => console.log('Injected!'));
//     });
// };

/**
 *
 * @class {FIDO2Client}
 */
module.exports.FIDO2Client = FIDO2Client;