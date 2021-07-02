"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrapAuthenticatorAttestationResponse = void 0;
const cbor_1 = require("cbor");
var AuthenticatorAttestationResponseName;
(function (AuthenticatorAttestationResponseName) {
    AuthenticatorAttestationResponseName["fmt"] = "fmt";
    AuthenticatorAttestationResponseName["attStmt"] = "attStmt";
    AuthenticatorAttestationResponseName["authData"] = "authData";
})(AuthenticatorAttestationResponseName || (AuthenticatorAttestationResponseName = {}));
class WrapAuthenticatorAttestationResponse {
    constructor(credential, clientData) {
        this.clientDataJSON = clientData.buffer.slice(clientData.byteOffset, clientData.byteOffset + clientData.byteLength);
        let map = new Map();
        map.set(AuthenticatorAttestationResponseName.fmt, credential.fmt);
        map.set(AuthenticatorAttestationResponseName.attStmt, credential.attStmt);
        map.set(AuthenticatorAttestationResponseName.authData, credential.authData);
        let cbor = cbor_1.encode(map);
        this.attestationObject = cbor.buffer.slice(cbor.byteOffset, cbor.byteOffset + cbor.byteLength);
    }
}
exports.WrapAuthenticatorAttestationResponse = WrapAuthenticatorAttestationResponse;
