/// <reference types="node" />
import { Fido2Credential } from "../ctap2/cmd/make-credential";
export declare class WrapAuthenticatorAttestationResponse implements AuthenticatorAttestationResponse {
    attestationObject: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
    constructor(credential: Fido2Credential, clientData: Buffer);
}
