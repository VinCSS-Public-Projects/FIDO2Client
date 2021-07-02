import { WrapPublicKeyCredentialCreationOptions } from "./WrapPublicKeyCredentialCreationOptions";

/**
 * See more
 * https://www.w3.org/TR/webauthn-2/#sctn-credentialcreationoptions-extension
 */
export interface WrapCredentialCreationOptions {
    publicKey?: WrapPublicKeyCredentialCreationOptions;
}