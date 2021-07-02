"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2GetAssertionRes = exports.Ctap2GetAssertionReq = exports.Ctap2GetAssertionCmd = void 0;
const cbor_1 = require("cbor");
const ctap2_1 = require("../../errors/ctap2");
exports.Ctap2GetAssertionCmd = 0x2;
var Ctap2GetAssertionReqName;
(function (Ctap2GetAssertionReqName) {
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["rpId"] = 1] = "rpId";
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["clientDataHash"] = 2] = "clientDataHash";
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["allowList"] = 3] = "allowList";
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["extensions"] = 4] = "extensions";
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["options"] = 5] = "options";
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["pinUvAuthParam"] = 6] = "pinUvAuthParam";
    Ctap2GetAssertionReqName[Ctap2GetAssertionReqName["pinUvAuthProtocol"] = 7] = "pinUvAuthProtocol";
})(Ctap2GetAssertionReqName || (Ctap2GetAssertionReqName = {}));
var Ctap2GetAssertionResName;
(function (Ctap2GetAssertionResName) {
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["credential"] = 1] = "credential";
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["authData"] = 2] = "authData";
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["signature"] = 3] = "signature";
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["user"] = 4] = "user";
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["numberOfCredentials"] = 5] = "numberOfCredentials";
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["userSelected"] = 6] = "userSelected";
    Ctap2GetAssertionResName[Ctap2GetAssertionResName["largeBlobKey"] = 7] = "largeBlobKey";
})(Ctap2GetAssertionResName || (Ctap2GetAssertionResName = {}));
class Ctap2GetAssertionReq {
    initialize(rpId, clientDataHash, allowList, extensions, options, pinUvAuthParam, pinUvAuthProtocol) {
        this.rpId = rpId;
        this.clientDataHash = clientDataHash;
        this.allowList = allowList;
        this.extensions = extensions;
        this.options = options;
        this.pinUvAuthParam = pinUvAuthParam;
        this.pinUvAuthProtocol = pinUvAuthProtocol;
        return this;
    }
    serialize() {
        let map = new Map();
        map.set(Ctap2GetAssertionReqName.rpId, this.rpId);
        map.set(Ctap2GetAssertionReqName.clientDataHash, this.clientDataHash);
        if (this.allowList)
            map.set(Ctap2GetAssertionReqName.allowList, this.allowList);
        if (this.extensions)
            map.set(Ctap2GetAssertionReqName.extensions, this.extensions);
        if (this.options)
            map.set(Ctap2GetAssertionReqName.options, this.options);
        if (this.pinUvAuthParam)
            map.set(Ctap2GetAssertionReqName.pinUvAuthParam, this.pinUvAuthParam);
        if (this.pinUvAuthProtocol)
            map.set(Ctap2GetAssertionReqName.pinUvAuthProtocol, this.pinUvAuthProtocol);
        return { cmd: exports.Ctap2GetAssertionCmd, data: cbor_1.encode(map) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2GetAssertionReq = Ctap2GetAssertionReq;
class Ctap2GetAssertionRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        let map;
        try {
            map = cbor_1.decodeFirstSync(payload);
        }
        catch (e) {
            throw new ctap2_1.Ctap2ErrInvalidCbor();
        }
        this.credential = map.get(Ctap2GetAssertionResName.credential);
        this.authData = map.get(Ctap2GetAssertionResName.authData);
        this.signature = map.get(Ctap2GetAssertionResName.signature);
        this.user = map.get(Ctap2GetAssertionResName.user);
        this.numberOfCredentials = map.get(Ctap2GetAssertionResName.numberOfCredentials);
        this.userSelected = map.get(Ctap2GetAssertionResName.userSelected);
        this.largeBlobKey = map.get(Ctap2GetAssertionResName.largeBlobKey);
        return this;
    }
}
exports.Ctap2GetAssertionRes = Ctap2GetAssertionRes;
