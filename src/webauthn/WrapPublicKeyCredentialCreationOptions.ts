import { WrapAuthenticationExtensionsClientInputs } from "./WrapAuthenticationExtensionsClientInputs";
import { WrapPublicKeyCredentialUserEntity } from "./WrapPublicKeyCredentialUserEntity";

/**
 * See more
 * https://www.w3.org/TR/webauthn-2/#dictdef-publickeycredentialcreationoptions
 */
export interface WrapPublicKeyCredentialCreationOptions extends PublicKeyCredentialCreationOptions {
    rp: PublicKeyCredentialRpEntity;
    user: WrapPublicKeyCredentialUserEntity;
    challenge: BufferSource;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout?: number;
    excludeCredentials?: PublicKeyCredentialDescriptor[];
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
    extensions?: WrapAuthenticationExtensionsClientInputs;
}