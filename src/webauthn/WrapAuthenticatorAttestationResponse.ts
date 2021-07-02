import { encode } from "cbor";
import { AttestationStatementFormat, Fido2Credential } from "../ctap2/cmd/make-credential";

enum AuthenticatorAttestationResponseName {
    fmt = 'fmt',
    attStmt = 'attStmt',
    authData = 'authData'
}

export class WrapAuthenticatorAttestationResponse implements AuthenticatorAttestationResponse {
    attestationObject: ArrayBuffer;
    clientDataJSON: ArrayBuffer;

    constructor(credential: Fido2Credential, clientData: Buffer) {
        this.clientDataJSON = clientData.buffer.slice(clientData.byteOffset, clientData.byteOffset + clientData.byteLength);
        let map = new Map<string, AttestationStatementFormat | Buffer>();
        map.set(AuthenticatorAttestationResponseName.fmt, credential.fmt);
        map.set(AuthenticatorAttestationResponseName.attStmt, credential.attStmt);
        map.set(AuthenticatorAttestationResponseName.authData, credential.authData);
        let cbor = encode(map);
        this.attestationObject = cbor.buffer.slice(cbor.byteOffset, cbor.byteOffset + cbor.byteLength);
    }
}