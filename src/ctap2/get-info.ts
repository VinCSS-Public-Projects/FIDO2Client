import { Fido2SpecVersion } from "environment";
import { Options } from "./cmd/get-info";

export interface Info {
    version: string[];
    extensions?: string[];
    aaguid: Buffer;
    options?: Options;
    maxMsgSize?: number;
    pinUvAuthProtocols?: number[];
    maxCredentialCountInList?: number;
    maxCredentialIdLength?: number;
    transports?: string[];
    algorithms?: string[];
    maxSerializedLargeBlobArray?: number;
    forcePINChange?: boolean;
    minPINLength?: number;
    firmwareVersion?: number;
    maxCredBlobLength?: number;
    maxRPIDsForSetMinPINLength?: number;
    preferredPlatformUvAttempts?: number;
    uvModality?: number;
    certifications?: Map<any, any>;
    remainingDiscoverableCredentials?: number;
    vendorPrototypeConfigCommands?: number[];

}