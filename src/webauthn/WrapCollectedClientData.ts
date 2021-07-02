
interface TokenBinding {
    status: TokenBindingStatus;
    id: string;
};

enum TokenBindingStatus { "present", "supported" };

export interface CollectedClientData {
    type: 'webauthn.create' | 'webauthn.get';
    challenge: string;
    origin: string;
    crossOrigin?: boolean;
    tokenBinding?: TokenBinding;
};