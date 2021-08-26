import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { decodeFirstSync } from 'cbor';
import { Ctap2ErrInvalidCbor } from "../../errors/ctap2";

export const Ctap2GetInfoCmd = 0x4;

export class Ctap2GetInfoReq implements ICtap2Cmd {
    initialize(...args: any[]): this {
        return this;
    }
    serialize(): Payload {
        return { cmd: Ctap2GetInfoCmd, data: Buffer.alloc(0) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}

enum Ctap2GetInfoName {
    version = 0x1,
    extensions = 0x2,
    aaguid = 0x3,
    options = 0x4,
    maxMsgSize = 0x5,
    pinUvAuthProtocols = 0x6,
    maxCredentialCountInList = 0x7,
    maxCredentialIdLength = 0x8,
    transports = 0x9,
    algorithms = 0xa,
    maxSerializedLargeBlobArray = 0xb,
    forcePINChange = 0xc,
    minPINLength = 0xd,
    firmwareVersion = 0xe,
    maxCredBlobLength = 0xf,
    maxRPIDsForSetMinPINLength = 0x10,
    preferredPlatformUvAttempts = 0x11,
    uvModality = 0x12,
    certifications = 0x13,
    remainingDiscoverableCredentials = 0x14,
    vendorPrototypeConfigCommands = 0x15
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

export class Ctap2GetInfoRes implements ICtap2Cmd {
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
    // TODO: recheck type
    certifications!: Map<any, any>;
    remainingDiscoverableCredentials!: number;
    vendorPrototypeConfigCommands!: number[];

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        let map: Map<number, string[] | string | number | boolean | Buffer | Options>;
        try {
            map = decodeFirstSync(payload);
        } catch (e) {
            throw new Ctap2ErrInvalidCbor();
        }
        this.version = map.get(Ctap2GetInfoName.version) as string[];
        this.extensions = map.get(Ctap2GetInfoName.extensions) as string[];
        this.aaguid = map.get(Ctap2GetInfoName.aaguid) as Buffer;
        this.options = map.get(Ctap2GetInfoName.options) as Options;
        this.maxMsgSize = map.get(Ctap2GetInfoName.maxMsgSize) as number;
        this.pinUvAuthProtocols = map.get(Ctap2GetInfoName.pinUvAuthProtocols) as number[];
        this.maxCredentialCountInList = map.get(Ctap2GetInfoName.maxCredentialCountInList) as number;
        this.maxCredentialIdLength = map.get(Ctap2GetInfoName.maxCredentialIdLength) as number;
        this.transports = map.get(Ctap2GetInfoName.transports) as string[];
        this.algorithms = map.get(Ctap2GetInfoName.algorithms) as string[];
        this.maxSerializedLargeBlobArray = map.get(Ctap2GetInfoName.maxSerializedLargeBlobArray) as number;
        this.forcePINChange = map.get(Ctap2GetInfoName.forcePINChange) as boolean;
        this.minPINLength = map.get(Ctap2GetInfoName.minPINLength) as number;
        this.firmwareVersion = map.get(Ctap2GetInfoName.firmwareVersion) as number;
        this.maxCredBlobLength = map.get(Ctap2GetInfoName.maxCredBlobLength) as number;
        this.maxRPIDsForSetMinPINLength = map.get(Ctap2GetInfoName.maxRPIDsForSetMinPINLength) as number;
        this.preferredPlatformUvAttempts = map.get(Ctap2GetInfoName.preferredPlatformUvAttempts) as number;
        this.uvModality = map.get(Ctap2GetInfoName.uvModality) as number;
        this.certifications = map.get(Ctap2GetInfoName.certifications) as Map<any, any>;
        this.remainingDiscoverableCredentials = map.get(Ctap2GetInfoName.remainingDiscoverableCredentials) as number;
        this.vendorPrototypeConfigCommands = map.get(Ctap2GetInfoName.vendorPrototypeConfigCommands) as number[];
        return this;
    }
}