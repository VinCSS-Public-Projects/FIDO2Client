import { WrapPublicKeyCredentialRequestOptions } from "./WrapPublicKeyCredentialRequestOptions";

/**
 * See more
 * https://www.w3.org/TR/webauthn-2/#sctn-credentialrequestoptions-extension
 */
export class WrapCredentialRequestOptions {
    publicKey!: WrapPublicKeyCredentialRequestOptions;
}