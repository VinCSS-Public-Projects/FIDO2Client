import { Options } from "./cmd/get-info";

export interface IInfo {
    version: Array<string>;
    extensions: Array<string>;
    aaguid: Buffer;
    options: Options;
    maxMsgSize: number;
    pinUvAuthProtocols: number[];
    maxCredentialCountInList: number;
    maxCredentialIdLength: number;
    transports: Array<string>;
    algorithms: Array<string>;
    maxSerializedLargeBlobArray: number;
    forcePINChange: boolean;
    minPINLength: number;
    firmwareVersion: number;
    maxCredBlobLength: number;
    maxRPIDsForSetMinPINLength: number;
    preferredPlatformUvAttempts: number;
    uvModality: number;
    // TODO: recheck type
    certifications: Map<any, any>;
    remainingDiscoverableCredentials: number;
    vendorPrototypeConfigCommands: Array<number>;
}

export class Info implements IInfo {
    version!: string[];
    extensions!: string[];
    aaguid!: Buffer;
    options!: Options;
    maxMsgSize!: number;
    pinUvAuthProtocols!: number[];
    maxCredentialCountInList!: number;
    maxCredentialIdLength!: number;
    transports!: string[];
    algorithms!: string[];
    maxSerializedLargeBlobArray!: number;
    forcePINChange!: boolean;
    minPINLength!: number;
    firmwareVersion!: number;
    maxCredBlobLength!: number;
    maxRPIDsForSetMinPINLength!: number;
    preferredPlatformUvAttempts!: number;
    uvModality!: number;
    certifications!: Map<any, any>;
    remainingDiscoverableCredentials!: number;
    vendorPrototypeConfigCommands!: number[];

}