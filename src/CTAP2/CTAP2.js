let Promise = require('bluebird');
const {CAPABILITY, TYPE_INT, CTAP_HID} = require('../Transports/Constants');
const {CTAP2_CMD, CLIENT_PIN_CMD, PIN_PROTOCOL_VERSION} = require('./Constants');
const {InfoResp, Attestation, Assertion, ClientPinResp, ClientPinReq} = require('./Models');
const CryptoUtils = require('../Utils/CryptoUtils');
const {CTAP2ErrorActionTimeout} = require('./Errors');
const {CTAP2KeepAliveCancel} = require('./Errors');
const {CTAP2ErrorPINBlocked} = require('./Errors');
let {
    CTAP2Error,
    CTAP2ErrorCode,
    CTAP2ErrorPINInvalid,
    CTAP2ErrorNoCredentials,
    CTAP2ErrorPINAuthBlocked
} = require('./Errors');

class CTAP2 {

    /**
     *
     * @param device {Device}
     */
    constructor(device) {
        if ((device.capabilities & CAPABILITY.CBOR) === 0) {
            console.log('Device not support CTAP2');
            throw Error('Device not support CTAP2')
        }
        /**
         *
         * @type {Device}
         */
        this.deivice = device;
        /**
         *
         * @type {boolean}
         */
        this.busy = false;
    }

    closeDevice = () => {
        if (this.deivice && this.deivice.deviceHandle) {
            this.deivice.deviceHandle.close();
            this.deivice = undefined;
        }
    };

    /**
     *
     * @param cmd {number}
     * @param data {Buffer}
     * @param onKeepAlive {function}
     * @returns {Promise<Buffer>}
     */
    sendCBOR(cmd, data, onKeepAlive = undefined) {

        let request = Buffer.alloc(data.length + 1);
        request.writeUInt8(cmd, 0);
        data.copy(request, 1);
        this.deivice.send(CTAP_HID.CBOR | TYPE_INT, request);
        let lastKeepAliveStatus = null;

        this.busy = true;

        return Promise.resolve().then(async () => {
            while (true) {

                // TODO convert to async
                let data;
                try {
                    data = await this.deivice.recv();
                } catch (e) {
                    console.log(e);
                    throw new Error('Error while reading data');
                }
                let cmd = data.cmd,
                    payload = data.payload;

                if (cmd === (CTAP_HID.CBOR | TYPE_INT)) {
                    this.busy = false;
                    return payload;
                } else if (cmd === CTAP_HID.ERROR) {
                    throw new Error(`HID error with code ${payload[0]}`);
                } else if (cmd === CTAP_HID.KEEPALIVE) {
                    let keepAliveStatus = payload[0];
                    if ((onKeepAlive !== undefined) && (lastKeepAliveStatus !== keepAliveStatus)) {
                        lastKeepAliveStatus = keepAliveStatus;
                        onKeepAlive(keepAliveStatus);
                    }
                } else {
                    throw new Error('CTAP2 invalid command');
                }
            }
        }).then((payload) => {

            if (payload[0] === CTAP2ErrorCode.PIN_INVALID) throw new CTAP2ErrorPINInvalid();
            if (payload[0] === CTAP2ErrorCode.NO_CREDENTIALS) throw new CTAP2ErrorNoCredentials();
            if (payload[0] === CTAP2ErrorCode.PIN_AUTH_BLOCKED) throw new CTAP2ErrorPINAuthBlocked();
            if (payload[0] === CTAP2ErrorCode.PIN_BLOCKED) throw new CTAP2ErrorPINBlocked();
            if (payload[0] === CTAP2ErrorCode.KEEPALIVE_CANCEL) throw new CTAP2KeepAliveCancel();
            if (payload[0] === CTAP2ErrorCode.ACTION_TIMEOUT) throw new CTAP2ErrorActionTimeout();
            if (payload[0] !== CTAP2ErrorCode.SUCCESS) throw new CTAP2Error(payload[0]);
            if (payload.length === 1) return Buffer.alloc(0);
            return payload.slice(1);
        });
    }

    /**
     *
     */
    cancel = () => {
        if (this.deivice && this.busy) this.deivice.send(CTAP_HID.CANCEL | TYPE_INT, Buffer.alloc(0));
        this.closeDevice();
    };

    /**
     * Get authenticator info.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#authenticatorGetInfo
     * @param onKeepAlive {function}
     * @returns {Promise<InfoResp>}
     */
    authenticatorGetInfo = (onKeepAlive = undefined) => {
        return this.sendCBOR(CTAP2_CMD.GET_INFO, Buffer.alloc(0), onKeepAlive).then((rsp) => {
            return new InfoResp(rsp);
        });
    };

    /**
     *  Make credential.
     *  https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#authenticatorMakeCredential
     * @param request {MakeCredential}
     * @param onKeepAlive {function}
     * @returns {Promise<Attestation>}
     */
    authenticatorMakeCredential = (request, onKeepAlive = undefined) => {
        return this.sendCBOR(CTAP2_CMD.MAKE_CREDENTIAL, request.toCBOR(), onKeepAlive).then((rsp) => {
            this.closeDevice();
            return new Attestation(rsp);
        });
    };

    /**
     * Get assertion.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#authenticatorGetAssertion
     * @param request {GetAssertion}
     * @param onKeepAlive {function}
     * @returns {Promise<Array<Assertion>>}
     */
    authenticatorGetAssertion = (request, onKeepAlive = undefined) => {
        return this.sendCBOR(CTAP2_CMD.GET_ASSERTION, request.toCBOR(), onKeepAlive).then(async (rsp) => {

            let credentialInfo = [];
            credentialInfo.push(new Assertion(rsp));

            for (let i = 1, numCreds = credentialInfo[0].numberOfCredentials; numCreds && i < numCreds; i++) {
                credentialInfo.push(await this.authenticatorGetNextAssertion());
            }

            this.closeDevice();
            return credentialInfo;
        })
    };

    /**
     * Get next assertion.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#authenticatorGetNextAssertion
     * @param onKeepAlive {function}
     * @returns {Promise<Assertion>}
     */
    authenticatorGetNextAssertion = async (onKeepAlive = undefined) => {
        return new Assertion(await this.sendCBOR(CTAP2_CMD.GET_NEXT_ASSERTION, Buffer.alloc(0), onKeepAlive));
    };

    /**
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#authenticatorClientPIN
     * @param request
     * @param onKeepAlive
     * @returns {Promise<ClientPinResp>}
     */
    authenticatorClientPIN = (request, onKeepAlive = undefined) => {
        return this.sendCBOR(CTAP2_CMD.CLIENT_PIN, request.toCBOR(), onKeepAlive).then((rsp) => {
            return new ClientPinResp(rsp);
        });
    };

    /**
     * Reset device (clear all data).
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#authenticatorReset
     * @param onKeepAlive {function}
     */
    authenticatorReset = (onKeepAlive = undefined) => {
        return this.sendCBOR(CTAP2_CMD.RESET, Buffer.from([]), onKeepAlive);
    }
}

class ClientPin {

    /**
     *
     * @param ctap2 {CTAP2}
     */
    constructor(ctap2) {
        this.ctap2 = ctap2;
    }

    /**
     * Getting Retries from Authenticator.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#gettingRetries
     * @returns {Promise<number>}
     */
    getPinRetries = () => {
        return this.ctap2.authenticatorClientPIN(new ClientPinReq(0x01, CLIENT_PIN_CMD.GET_RETRIES)).then((rsp) => {
            return rsp.retries;
        });
    };

    /**
     * Getting sharedSecret from Authenticator.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#gettingSharedSecret
     * @returns {Promise<{keyAgreement: Map<any, any>, sharedSecret: Buffer}>}
     */
    getSharedSecret() {
        return this.ctap2.authenticatorClientPIN(new ClientPinReq(0x01, CLIENT_PIN_CMD.GET_KEY_AGREEMENT)).then((clientPinResp) => {
            let key = CryptoUtils.GenerateP256DHKeys(),
                sharedSecret = CryptoUtils.GenerateSharedSecret(key.privateKey, CryptoUtils.COSEECDHAToPKCS(clientPinResp.keyAgreement.get(-2), clientPinResp.keyAgreement.get(-3))),
                keyAgreement = new Map();
            keyAgreement.set(1, 2);
            keyAgreement.set(-1, 1);
            keyAgreement.set(3, -25);
            keyAgreement.set(-2, key.publicKey.slice(1, 33));
            keyAgreement.set(-3, key.publicKey.slice(33));
            return {keyAgreement, sharedSecret};
        });
    }

    /**
     * Setting a New PIN.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#settingNewPin
     * @param pin {string}
     * @returns {Promise<any>}
     */
    setPin = (pin) => {
        let encryptedBuffer = Buffer.alloc(64).fill(0);
        encryptedBuffer.set(Buffer.from(pin, 'utf-8'));
        return this.getSharedSecret().then((data) => {
            let keyAgreement = data.keyAgreement,
                sharedSecret = data.sharedSecret,
                newPinEnc = CryptoUtils.EncryptAES256IV0(sharedSecret, encryptedBuffer),
                newPinHMAC = CryptoUtils.HMACSHA256(sharedSecret, newPinEnc),
                pinAuth = newPinHMAC.slice(0, 16);
            return this.ctap2.authenticatorClientPIN(new ClientPinReq(
                PIN_PROTOCOL_VERSION,
                CLIENT_PIN_CMD.SET_PIN,
                keyAgreement,
                pinAuth,
                newPinEnc)
            );
        });
    };

    /**
     * Changing existing PIN.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#changingExistingPin
     * @param oldPin {string}
     * @param newPin {string}
     */
    changePin(oldPin, newPin) {

        return this.getSharedSecret().then((key) => {
            let keyAgreement = key.keyAgreement,
                sharedSecret = key.sharedSecret,
                encryptedBuffer = Buffer.alloc(64).fill(0);

            encryptedBuffer.set(Buffer.from(newPin, 'utf-8'));

            let newPinEnc = CryptoUtils.EncryptAES256IV0(sharedSecret, encryptedBuffer),
                pinLeft = CryptoUtils.SHA256(Buffer.from(oldPin, 'utf-8')).slice(0, 16),
                pinHashEnc = CryptoUtils.EncryptAES256IV0(sharedSecret, pinLeft),
                pinAuthHMAC = CryptoUtils.HMACSHA256(sharedSecret, Buffer.concat([newPinEnc, pinHashEnc], newPinEnc.length + pinHashEnc.length));

            return this.ctap2.authenticatorClientPIN(new ClientPinReq(
                PIN_PROTOCOL_VERSION,
                CLIENT_PIN_CMD.CHANGE_PIN,
                keyAgreement,
                pinAuthHMAC.slice(0, 16),
                newPinEnc,
                pinHashEnc
            ));
        })
    }

    /**
     * Getting pinToken from the Authenticator.
     * https://fidoalliance.org/specs/fido-v2.0-id-20180227/fido-client-to-authenticator-protocol-v2.0-id-20180227.html#gettingPinToken
     * @param pin
     * @returns {Promise<Buffer>}
     */
    getPinToken = (pin) => {
        return this.getSharedSecret().then((data) => {
            let keyAgreement = data.keyAgreement,
                sharedSecret = data.sharedSecret,
                pinCodeLeft = CryptoUtils.SHA256(Buffer.from(pin, 'utf-8')).slice(0, 16),
                pinEnc = CryptoUtils.EncryptAES256IV0(sharedSecret, pinCodeLeft);

            return this.ctap2.authenticatorClientPIN(new ClientPinReq(
                PIN_PROTOCOL_VERSION,
                CLIENT_PIN_CMD.GET_PIN_TOKEN,
                keyAgreement,
                undefined,
                undefined,
                pinEnc)
            ).then((rsp) => {
                return CryptoUtils.DecryptAES256IV0(sharedSecret, rsp.pinToken);
            });
        });
    }
}

/**
 *
 * @type {CTAP2}
 */
module.exports.CTAP2 = CTAP2;

/**
 *
 * @type {ClientPin}
 */
module.exports.ClientPin = ClientPin;