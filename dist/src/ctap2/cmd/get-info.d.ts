/// <reference types="node" />
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
export declare const Ctap2GetInfoCmd = 4;
export declare class Ctap2GetInfoReq implements ICtap2Cmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export interface Options {
    plat?: boolean;
    rk?: boolean;
    clientPin?: boolean;
    up?: boolean;
    uv?: boolean;
    pinUvAuthToken?: boolean;
    noMcGaPermissionsWithClientPin?: boolean;
    largeBlobs?: boolean;
    ep?: boolean;
    bioEnroll?: boolean;
    userVerificationMgmtPreview?: boolean;
    uvBioEnroll?: boolean;
    authnrCfg?: boolean;
    uvAcfg?: boolean;
    credMgmt?: boolean;
    credentialMgmtPreview?: boolean;
    setMinPINLength?: boolean;
    makeCredUvNotRqd?: boolean;
    alwaysUv?: boolean;
}
export declare class Ctap2GetInfoRes implements ICtap2Cmd {
    version: string[];
    extensions: string[];
    aaguid: Buffer;
    options: Options;
    maxMsgSize: number;
    pinUvAuthProtocols: number[];
    maxCredentialCountInList: number;
    maxCredentialIdLength: number;
    transports: string[];
    algorithms: string[];
    maxSerializedLargeBlobArray: number;
    forcePINChange: boolean;
    minPINLength: number;
    firmwareVersion: number;
    maxCredBlobLength: number;
    maxRPIDsForSetMinPINLength: number;
    preferredPlatformUvAttempts: number;
    uvModality: number;
    certifications: Map<any, any>;
    remainingDiscoverableCredentials: number;
    vendorPrototypeConfigCommands: number[];
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
