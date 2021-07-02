interface TokenBinding {
    status: TokenBindingStatus;
    id: string;
}
declare enum TokenBindingStatus {
    "present" = 0,
    "supported" = 1
}
export interface CollectedClientData {
    type: 'webauthn.create' | 'webauthn.get';
    challenge: string;
    origin: string;
    crossOrigin?: boolean;
    tokenBinding?: TokenBinding;
}
export {};
