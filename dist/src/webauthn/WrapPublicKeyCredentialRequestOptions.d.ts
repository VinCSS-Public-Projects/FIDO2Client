import { WrapAuthenticationExtensionsClientInputs } from "./WrapAuthenticationExtensionsClientInputs";
/**
 * See more
 * https://www.w3.org/TR/webauthn-2/#dictdef-publickeycredentialrequestoptions
 */
export interface WrapPublicKeyCredentialRequestOptions extends PublicKeyCredentialRequestOptions {
    challenge: BufferSource;
    timeout?: number;
    rpId?: string;
    allowCredentials?: PublicKeyCredentialDescriptor[];
    userVerification?: UserVerificationRequirement;
    extensions?: WrapAuthenticationExtensionsClientInputs;
}
