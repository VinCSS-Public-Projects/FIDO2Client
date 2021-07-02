export interface WrapAuthenticationExtensionsLargeBlobInputs {
    support: 'required' | 'preferred'
    read: boolean;
    write: Buffer;
}