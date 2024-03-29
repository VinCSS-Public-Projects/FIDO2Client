"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2Cli = exports.Ctap2Cmd = void 0;
const environment_1 = require("../../environment");
const crypto_1 = require("../crypto/crypto");
const ctap2_1 = require("../errors/ctap2");
const client_pin_1 = require("./cmd/client-pin");
const get_assertion_1 = require("./cmd/get-assertion");
const get_info_1 = require("./cmd/get-info");
const get_next_assertion_1 = require("./cmd/get-next-assertion");
const make_credential_1 = require("./cmd/make-credential");
var Ctap2Cmd;
(function (Ctap2Cmd) {
    Ctap2Cmd[Ctap2Cmd["MakeCredential"] = 1] = "MakeCredential";
    Ctap2Cmd[Ctap2Cmd["GetAssertion"] = 2] = "GetAssertion";
    Ctap2Cmd[Ctap2Cmd["GetNextAssertion"] = 8] = "GetNextAssertion";
    Ctap2Cmd[Ctap2Cmd["GetInfo"] = 4] = "GetInfo";
    Ctap2Cmd[Ctap2Cmd["ClientPIN"] = 6] = "ClientPIN";
    Ctap2Cmd[Ctap2Cmd["Reset"] = 7] = "Reset";
    Ctap2Cmd[Ctap2Cmd["BioEnrollment"] = 9] = "BioEnrollment";
    Ctap2Cmd[Ctap2Cmd["Selection"] = 11] = "Selection";
    Ctap2Cmd[Ctap2Cmd["LargeBlobs"] = 12] = "LargeBlobs";
    Ctap2Cmd[Ctap2Cmd["Config"] = 13] = "Config";
})(Ctap2Cmd = exports.Ctap2Cmd || (exports.Ctap2Cmd = {}));
class Ctap2Cli {
    constructor(_devcie, _clientPin) {
        this._devcie = _devcie;
        this._clientPin = _clientPin;
    }
    async makeCredential(option, keepAlive) {
        let { clientDataHash, rp, user, pubKeyCredParams, excludeList, extensions, options, pinUvAuthParam, pinUvAuthProtocol, enterpriseAttestation } = option;
        let req = new make_credential_1.Ctap2MakeCredentialReq().initialize(clientDataHash, rp, user, pubKeyCredParams, excludeList, extensions, options, pinUvAuthParam, pinUvAuthProtocol, enterpriseAttestation);
        let res = await (await this._devcie.console).cbor(req.serialize(), keepAlive);
        let credential = new make_credential_1.Ctap2MakeCredentialRes().deserialize(res);
        return Object.assign({}, credential);
    }
    async getAssertion(option, keepAlive) {
        let { rpId, clientDataHash, allowList, extensions, options, pinUvAuthParam, pinUvAuthProtocol } = option;
        let req = new get_assertion_1.Ctap2GetAssertionReq().initialize(rpId, clientDataHash, allowList, extensions, options, pinUvAuthParam, pinUvAuthProtocol);
        let res = await (await this._devcie.console).cbor(req.serialize(), keepAlive);
        let credential = new get_assertion_1.Ctap2GetAssertionRes().deserialize(res);
        return [credential, ...await Promise.all(new Array((credential.numberOfCredentials && credential.numberOfCredentials > 1) ? credential.numberOfCredentials - 1 : 0).fill(true).map(async (x) => await this.getNextAssertion(keepAlive)))];
    }
    async getNextAssertion(keepAlive) {
        let req = new get_next_assertion_1.Ctap2GetNextAssertionReq().initialize();
        let res = await (await this._devcie.console).cbor(req.serialize(), keepAlive);
        let credential = new get_assertion_1.Ctap2GetAssertionRes().deserialize(res);
        return Object.assign({}, credential);
    }
    async info() {
        let req = new get_info_1.Ctap2GetInfoReq().initialize();
        let res = await (await this._devcie.console).cbor(req.serialize());
        let info = new get_info_1.Ctap2GetInfoRes().deserialize(res);
        return info;
    }
    get clientPin() {
        return {
            getPinRetries: async () => {
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_0:
                    case environment_1.Fido2SpecVersion.FIDO_2_1_PRE:
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        let req = new client_pin_1.Ctap2ClientPinReq().initialize(this._clientPin.version, client_pin_1.ClientPinSubCommand.getPinRetries);
                        let cbor = await (await this._devcie.console).cbor(req.serialize());
                        let res = new client_pin_1.Ctap2ClientPinRes().deserialize(cbor);
                        if (res.pinRetries === undefined) {
                            throw new ctap2_1.Ctap2ErrInvalidSubcommand();
                        }
                        return res.pinRetries;
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            getKeyAgreement: async () => {
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_0:
                    case environment_1.Fido2SpecVersion.FIDO_2_1_PRE:
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        let req = new client_pin_1.Ctap2ClientPinReq().initialize(environment_1.ClientPinVersion.v1, client_pin_1.ClientPinSubCommand.getKeyAgreement);
                        let cbor = await (await this._devcie.console).cbor(req.serialize());
                        let res = new client_pin_1.Ctap2ClientPinRes().deserialize(cbor);
                        if (res.keyAgreement === undefined) {
                            throw new ctap2_1.Ctap2ErrInvalidSubcommand();
                        }
                        return res.keyAgreement;
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            setPin: async (pin) => {
                // TODO: check pin policy
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_0:
                    case environment_1.Fido2SpecVersion.FIDO_2_1_PRE:
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        let keyAgreement = await this.clientPin.getKeyAgreement();
                        let newPin = Buffer.alloc(64);
                        newPin.write(pin);
                        let capsulate = this._clientPin.encapsulate(keyAgreement);
                        let newPinEnc = this._clientPin.encrypt(capsulate.sharedSecret, newPin);
                        let req = new client_pin_1.Ctap2ClientPinReq().initialize(environment_1.ClientPinVersion.v1, client_pin_1.ClientPinSubCommand.setPin, capsulate.platformKeyAgreement, this._clientPin.authenticate(capsulate.sharedSecret, newPinEnc), newPinEnc);
                        (await this._devcie.console).cbor(req.serialize());
                        return;
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            changePin: async (curPinUnicode, newPinUnicode) => {
                // TODO: check pin policy
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_0:
                    case environment_1.Fido2SpecVersion.FIDO_2_1_PRE:
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        let keyAgreement = await this.clientPin.getKeyAgreement();
                        let curPin = Buffer.from(curPinUnicode);
                        let newPin = Buffer.alloc(64);
                        newPin.write(newPinUnicode);
                        let capsulate = this._clientPin.encapsulate(keyAgreement);
                        let pinHashEnc = this._clientPin.encrypt(capsulate.sharedSecret, crypto_1.Fido2Crypto.hash(curPin).slice(0, 16));
                        let newPinEnc = this._clientPin.encrypt(capsulate.sharedSecret, newPin);
                        let req = new client_pin_1.Ctap2ClientPinReq().initialize(environment_1.ClientPinVersion.v1, client_pin_1.ClientPinSubCommand.changePin, capsulate.platformKeyAgreement, this._clientPin.authenticate(capsulate.sharedSecret, Buffer.concat([newPinEnc, pinHashEnc])), newPinEnc, pinHashEnc);
                        (await this._devcie.console).cbor(req.serialize());
                        return;
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            getPinToken: async (pinUnicode) => {
                // TODO: check pin policy
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_0:
                    case environment_1.Fido2SpecVersion.FIDO_2_1_PRE:
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        let keyAgreement = await this.clientPin.getKeyAgreement();
                        let pin = Buffer.from(pinUnicode);
                        let capsulate = this._clientPin.encapsulate(keyAgreement);
                        let req = new client_pin_1.Ctap2ClientPinReq().initialize(environment_1.ClientPinVersion.v1, client_pin_1.ClientPinSubCommand.getPinToken, capsulate.platformKeyAgreement, undefined, undefined, this._clientPin.encrypt(capsulate.sharedSecret, crypto_1.Fido2Crypto.hash(pin).slice(0, 16)));
                        let cbor = await (await this._devcie.console).cbor(req.serialize());
                        let res = new client_pin_1.Ctap2ClientPinRes().deserialize(cbor);
                        if (res.pinUvAuthToken === undefined) {
                            throw new ctap2_1.Ctap2ErrInvalidSubcommand();
                        }
                        return this._clientPin.decrypt(this._clientPin.decapsulate(keyAgreement), res.pinUvAuthToken);
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            getPinUvAuthTokenUsingUvWithPermissions: () => {
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        throw new Error("Method not implemented.");
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            getUVRetries: async () => {
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_0:
                    case environment_1.Fido2SpecVersion.FIDO_2_1_PRE:
                        return 0;
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        let req = new client_pin_1.Ctap2ClientPinReq().initialize(this._clientPin.version, client_pin_1.ClientPinSubCommand.getUVRetries);
                        let cbor = await (await this._devcie.console).cbor(req.serialize());
                        let res = new client_pin_1.Ctap2ClientPinRes().deserialize(cbor);
                        if (res.uvRetries === undefined) {
                            throw new ctap2_1.Ctap2ErrInvalidSubcommand();
                        }
                        return res.uvRetries;
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            getPinUvAuthTokenUsingPinWithPermissions: () => {
                switch (environment_1.getLatestSpecVersion(this._devcie.info.version)) {
                    case environment_1.Fido2SpecVersion.FIDO_2_1:
                        throw new Error("Method not implemented.");
                    default:
                        throw new ctap2_1.Ctap2DevcieNotCapable();
                }
            },
            console: this._clientPin,
            version: this._clientPin.version
        };
    }
    reset() {
        throw new Error("Method not implemented.");
    }
    bioEnrollment() {
        throw new Error("Method not implemented.");
    }
    credentialManagement() {
        throw new Error("Method not implemented.");
    }
    selection() {
        throw new Error("Method not implemented.");
    }
    largeBlobs() {
        throw new Error("Method not implemented.");
    }
    config() {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2Cli = Ctap2Cli;
//# sourceMappingURL=ctap2.js.map