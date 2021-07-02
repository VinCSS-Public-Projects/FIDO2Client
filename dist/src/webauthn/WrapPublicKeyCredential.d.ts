export interface WrapPublicKeyCredential extends Omit<PublicKeyCredential, 'getClientExtensionResults'> {
    rawId: ArrayBuffer;
    response: AuthenticatorResponse;
    clientExtensionResults: any;
    id: string;
    type: PublicKeyCredentialType;
}
