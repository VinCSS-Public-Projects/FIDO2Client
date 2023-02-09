"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2MakeCredentialRes = exports.Ctap2MakeCredentialReq = exports.Ctap2MakeCredentialCmd = void 0;
const cbor_1 = require("cbor");
const ctap2_1 = require("../../errors/ctap2");
exports.Ctap2MakeCredentialCmd = 0x1;
var Ctap2MakeCredentialReqName;
(function (Ctap2MakeCredentialReqName) {
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["clientDataHash"] = 1] = "clientDataHash";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["rp"] = 2] = "rp";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["user"] = 3] = "user";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["pubKeyCredParams"] = 4] = "pubKeyCredParams";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["excludeList"] = 5] = "excludeList";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["extensions"] = 6] = "extensions";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["options"] = 7] = "options";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["pinUvAuthParam"] = 8] = "pinUvAuthParam";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["pinUvAuthProtocol"] = 9] = "pinUvAuthProtocol";
    Ctap2MakeCredentialReqName[Ctap2MakeCredentialReqName["enterpriseAttestation"] = 10] = "enterpriseAttestation";
})(Ctap2MakeCredentialReqName || (Ctap2MakeCredentialReqName = {}));
var Ctap2MakeCredentialResName;
(function (Ctap2MakeCredentialResName) {
    Ctap2MakeCredentialResName[Ctap2MakeCredentialResName["fmt"] = 1] = "fmt";
    Ctap2MakeCredentialResName[Ctap2MakeCredentialResName["authData"] = 2] = "authData";
    Ctap2MakeCredentialResName[Ctap2MakeCredentialResName["attStmt"] = 3] = "attStmt";
    Ctap2MakeCredentialResName[Ctap2MakeCredentialResName["epAtt"] = 4] = "epAtt";
    Ctap2MakeCredentialResName[Ctap2MakeCredentialResName["largeBlobKey"] = 5] = "largeBlobKey";
})(Ctap2MakeCredentialResName || (Ctap2MakeCredentialResName = {}));
class Ctap2MakeCredentialReq {
    initialize(clientDataHash, rp, user, pubKeyCredParams, excludeList, extensions, options, pinUvAuthParam, pinUvAuthProtocol, enterpriseAttestation) {
        this.clientDataHash = clientDataHash;
        this.rp = rp;
        this.user = user;
        this.pubKeyCredParams = pubKeyCredParams;
        this.excludeList = excludeList;
        this.extensions = extensions;
        this.options = options;
        this.pinUvAuthParam = pinUvAuthParam;
        this.pinUvAuthProtocol = pinUvAuthProtocol;
        this.enterpriseAttestation = enterpriseAttestation;
        return this;
    }
    serialize() {
        let map = new Map();
        map.set(Ctap2MakeCredentialReqName.clientDataHash, this.clientDataHash);
        map.set(Ctap2MakeCredentialReqName.rp, this.rp);
        map.set(Ctap2MakeCredentialReqName.user, this.user);
        map.set(Ctap2MakeCredentialReqName.pubKeyCredParams, this.pubKeyCredParams);
        if (this.excludeList && this.excludeList.length)
            map.set(Ctap2MakeCredentialReqName.excludeList, this.excludeList);
        if (this.extensions)
            map.set(Ctap2MakeCredentialReqName.extensions, this.extensions);
        if (this.options)
            map.set(Ctap2MakeCredentialReqName.options, this.options);
        if (this.pinUvAuthParam)
            map.set(Ctap2MakeCredentialReqName.pinUvAuthParam, this.pinUvAuthParam);
        if (this.pinUvAuthProtocol)
            map.set(Ctap2MakeCredentialReqName.pinUvAuthProtocol, this.pinUvAuthProtocol);
        if (this.enterpriseAttestation)
            map.set(Ctap2MakeCredentialReqName.enterpriseAttestation, this.enterpriseAttestation);
        return { cmd: exports.Ctap2MakeCredentialCmd, data: cbor_1.encode(map) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2MakeCredentialReq = Ctap2MakeCredentialReq;
class Ctap2MakeCredentialRes {
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
        this.fmt = map.get(Ctap2MakeCredentialResName.fmt);
        this.authData = map.get(Ctap2MakeCredentialResName.authData);
        this.attStmt = map.get(Ctap2MakeCredentialResName.attStmt);
        this.epAtt = map.get(Ctap2MakeCredentialResName.epAtt);
        this.largeBlobKey = map.get(Ctap2MakeCredentialResName.largeBlobKey);
        return this;
    }
}
exports.Ctap2MakeCredentialRes = Ctap2MakeCredentialRes;
//# sourceMappingURL=make-credential.js.map