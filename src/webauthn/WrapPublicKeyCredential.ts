import { WrapAuthenticationExtensionsClientOutputs } from "./WrapAuthenticationExtensionsClientOutputs";

export interface WrapPublicKeyCredential extends Omit<PublicKeyCredential, 'getClientExtensionResults'> {
    rawId: ArrayBuffer;
    response: AuthenticatorResponse;
    // getClientExtensionResults(): WrapAuthenticationExtensionsClientOutputs;
    clientExtensionResults: any;
    id: string;
    type: PublicKeyCredentialType;
}