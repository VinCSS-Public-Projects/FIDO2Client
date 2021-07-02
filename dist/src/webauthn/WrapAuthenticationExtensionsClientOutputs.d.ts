export interface WrapAuthenticationExtensionsClientOutputs {
    hmacCreateSecret?: boolean;
    hmacGetSecret?: {
        output1: ArrayBuffer;
        output2?: ArrayBuffer;
    };
}
