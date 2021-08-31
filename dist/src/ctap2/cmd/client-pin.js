"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2ClientPinRes = exports.Ctap2ClientPinReq = exports.Ctap2ClientPinNameRes = exports.Ctap2ClientPinNameReq = exports.ClientPinSubCommand = exports.Ctap2ClientPinCmd = void 0;
const cbor_1 = require("cbor");
const client_pin_1 = require("../client-pin");
const ctap2_1 = require("../../errors/ctap2");
exports.Ctap2ClientPinCmd = 0x6;
var ClientPinSubCommand;
(function (ClientPinSubCommand) {
    ClientPinSubCommand[ClientPinSubCommand["getPinRetries"] = 1] = "getPinRetries";
    ClientPinSubCommand[ClientPinSubCommand["getKeyAgreement"] = 2] = "getKeyAgreement";
    ClientPinSubCommand[ClientPinSubCommand["setPin"] = 3] = "setPin";
    ClientPinSubCommand[ClientPinSubCommand["changePin"] = 4] = "changePin";
    ClientPinSubCommand[ClientPinSubCommand["getPinToken"] = 5] = "getPinToken";
    ClientPinSubCommand[ClientPinSubCommand["getPinUvAuthTokenUsingUvWithPermissions"] = 6] = "getPinUvAuthTokenUsingUvWithPermissions";
    ClientPinSubCommand[ClientPinSubCommand["getUVRetries"] = 7] = "getUVRetries";
    ClientPinSubCommand[ClientPinSubCommand["getPinUvAuthTokenUsingPinWithPermissions"] = 9] = "getPinUvAuthTokenUsingPinWithPermissions";
})(ClientPinSubCommand = exports.ClientPinSubCommand || (exports.ClientPinSubCommand = {}));
var Ctap2ClientPinNameReq;
(function (Ctap2ClientPinNameReq) {
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["pinUvAuthProtocol"] = 1] = "pinUvAuthProtocol";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["subCommand"] = 2] = "subCommand";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["keyAgreement"] = 3] = "keyAgreement";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["pinUvAuthParam"] = 4] = "pinUvAuthParam";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["newPinEnc"] = 5] = "newPinEnc";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["pinHashEnc"] = 6] = "pinHashEnc";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["permissions"] = 9] = "permissions";
    Ctap2ClientPinNameReq[Ctap2ClientPinNameReq["permissionsRpId"] = 10] = "permissionsRpId";
})(Ctap2ClientPinNameReq = exports.Ctap2ClientPinNameReq || (exports.Ctap2ClientPinNameReq = {}));
var Ctap2ClientPinNameRes;
(function (Ctap2ClientPinNameRes) {
    Ctap2ClientPinNameRes[Ctap2ClientPinNameRes["keyAgreement"] = 1] = "keyAgreement";
    Ctap2ClientPinNameRes[Ctap2ClientPinNameRes["pinUvAuthToken"] = 2] = "pinUvAuthToken";
    Ctap2ClientPinNameRes[Ctap2ClientPinNameRes["pinRetries"] = 3] = "pinRetries";
    Ctap2ClientPinNameRes[Ctap2ClientPinNameRes["powerCycleState"] = 4] = "powerCycleState";
    Ctap2ClientPinNameRes[Ctap2ClientPinNameRes["uvRetries"] = 5] = "uvRetries";
})(Ctap2ClientPinNameRes = exports.Ctap2ClientPinNameRes || (exports.Ctap2ClientPinNameRes = {}));
class Ctap2ClientPinReq {
    constructor() { }
    initialize(pinUvAuthProtocol, subCommand, keyAgreement, pinUvAuthParam, newPinEnc, pinHashEnc, permissions, permissionsRpId) {
        this.pinUvAuthProtocol = pinUvAuthProtocol;
        this.subCommand = subCommand;
        this.keyAgreement = keyAgreement;
        this.pinUvAuthParam = pinUvAuthParam;
        this.newPinEnc = newPinEnc;
        this.pinHashEnc = pinHashEnc;
        this.permissions = permissions;
        this.permissionsRpId = permissionsRpId;
        return this;
    }
    serialize() {
        let cbor = new Map();
        if (this.pinUvAuthProtocol)
            cbor.set(Ctap2ClientPinNameReq.pinUvAuthProtocol, this.pinUvAuthProtocol);
        cbor.set(Ctap2ClientPinNameReq.subCommand, this.subCommand);
        if (this.keyAgreement)
            cbor.set(Ctap2ClientPinNameReq.keyAgreement, this.keyAgreement.serialize());
        if (this.pinUvAuthParam)
            cbor.set(Ctap2ClientPinNameReq.pinUvAuthParam, this.pinUvAuthParam);
        if (this.newPinEnc)
            cbor.set(Ctap2ClientPinNameReq.newPinEnc, this.newPinEnc);
        if (this.pinHashEnc)
            cbor.set(Ctap2ClientPinNameReq.pinHashEnc, this.pinHashEnc);
        if (this.permissions)
            cbor.set(Ctap2ClientPinNameReq.permissions, this.permissions);
        if (this.permissionsRpId)
            cbor.set(Ctap2ClientPinNameReq.permissionsRpId, this.permissionsRpId);
        return { cmd: exports.Ctap2ClientPinCmd, data: (0, cbor_1.encode)(cbor) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2ClientPinReq = Ctap2ClientPinReq;
class Ctap2ClientPinRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        let map;
        try {
            map = (0, cbor_1.decodeFirstSync)(payload);
        }
        catch (e) {
            throw new ctap2_1.Ctap2ErrInvalidCbor();
        }
        if (map.get(Ctap2ClientPinNameRes.keyAgreement))
            this.keyAgreement = new client_pin_1.COSEKey().deserialize(map.get(Ctap2ClientPinNameRes.keyAgreement));
        this.pinUvAuthToken = map.get(Ctap2ClientPinNameRes.pinUvAuthToken);
        this.pinRetries = map.get(Ctap2ClientPinNameRes.pinRetries);
        this.powerCycleState = map.get(Ctap2ClientPinNameRes.powerCycleState);
        this.uvRetries = map.get(Ctap2ClientPinNameRes.uvRetries);
        return this;
    }
}
exports.Ctap2ClientPinRes = Ctap2ClientPinRes;
//# sourceMappingURL=client-pin.js.map