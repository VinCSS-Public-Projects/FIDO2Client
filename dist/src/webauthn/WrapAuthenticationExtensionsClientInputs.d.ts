/// <reference types="node" />
import { WrapAuthenticationExtensionsLargeBlobInputs } from "./WrapAuthenticationExtensionsLargeBlobInputs";
export interface WrapAuthenticationExtensionsClientInputs {
    appid?: string;
    appidExclude?: string;
    uvm?: boolean;
    credProps?: boolean;
    largeBlob?: WrapAuthenticationExtensionsLargeBlobInputs;
    credentialProtectionPolicy?: string;
    enforceCredentialProtectionPolicy?: boolean;
    credBlob?: Buffer;
    getCredBlob?: boolean;
    largeBlobKey?: any;
    minPinLength?: boolean;
    hmacCreateSecret?: boolean;
    hmacGetSecret?: {
        salt1: Buffer;
        salt2?: Buffer;
    };
}
