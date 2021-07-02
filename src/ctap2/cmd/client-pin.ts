import { ClientPinVersion } from "../../../environment";
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { decodeFirstSync, encode } from 'cbor';
import { COSEKey } from "../client-pin";
import { Ctap2ErrInvalidCbor } from "../../errors/ctap2";

export const Ctap2ClientPinCmd = 0x6;

export enum ClientPinSubCommand {
    getPinRetries = 0x1,
    getKeyAgreement = 0x2,
    setPin = 0x3,
    changePin = 0x4,
    getPinToken = 0x5,
    getPinUvAuthTokenUsingUvWithPermissions = 0x6,
    getUVRetries = 0x7,
    getPinUvAuthTokenUsingPinWithPermissions = 0x9
}

export enum Ctap2ClientPinNameReq {
    pinUvAuthProtocol = 0x1,
    subCommand = 0x2,
    keyAgreement = 0x3,
    pinUvAuthParam = 0x4,
    newPinEnc = 0x5,
    pinHashEnc = 0x6,
    permissions = 0x9,
    permissionsRpId = 0xa
}

export enum Ctap2ClientPinNameRes {
    keyAgreement = 0x1,
    pinUvAuthToken = 0x2,
    pinRetries = 0x3,
    powerCycleState = 0x4,
    uvRetries = 0x5
}

export class Ctap2ClientPinReq implements ICtap2Cmd {
    pinUvAuthProtocol!: number;
    subCommand!: ClientPinSubCommand;
    keyAgreement: COSEKey | undefined;
    pinUvAuthParam: Buffer | undefined;
    newPinEnc: Buffer | undefined;
    pinHashEnc: Buffer | undefined;
    permissions: Permissions | undefined;
    permissionsRpId: string | undefined;

    constructor() { }

    initialize(pinUvAuthProtocol: ClientPinVersion, subCommand: ClientPinSubCommand, keyAgreement?: COSEKey, pinUvAuthParam?: Buffer, newPinEnc?: Buffer, pinHashEnc?: Buffer, permissions?: Permissions, permissionsRpId?: string): this {
        this.pinUvAuthProtocol = pinUvAuthProtocol;
        this.subCommand = subCommand;
        this.keyAgreement = keyAgreement;
        this.pinUvAuthParam = pinUvAuthParam;
        this.newPinEnc = newPinEnc;
        this.pinHashEnc = pinHashEnc;
        this.permissions = permissions;
        this.permissionsRpId = permissionsRpId;
        return this;
    }
    serialize(): Payload {
        let cbor = new Map<number, number | Buffer | string | Permissions | Map<number, number | Buffer>>();
        if (this.pinUvAuthProtocol) cbor.set(Ctap2ClientPinNameReq.pinUvAuthProtocol, this.pinUvAuthProtocol);
        cbor.set(Ctap2ClientPinNameReq.subCommand, this.subCommand);
        if (this.keyAgreement) cbor.set(Ctap2ClientPinNameReq.keyAgreement, this.keyAgreement.serialize());
        if (this.pinUvAuthParam) cbor.set(Ctap2ClientPinNameReq.pinUvAuthParam, this.pinUvAuthParam);
        if (this.newPinEnc) cbor.set(Ctap2ClientPinNameReq.newPinEnc, this.newPinEnc);
        if (this.pinHashEnc) cbor.set(Ctap2ClientPinNameReq.pinHashEnc, this.pinHashEnc);
        if (this.permissions) cbor.set(Ctap2ClientPinNameReq.permissions, this.permissions);
        if (this.permissionsRpId) cbor.set(Ctap2ClientPinNameReq.permissionsRpId, this.permissionsRpId);
        return { cmd: Ctap2ClientPinCmd, data: encode(cbor) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class Ctap2ClientPinRes implements ICtap2Cmd {
    keyAgreement: COSEKey | undefined;
    pinUvAuthToken: Buffer | undefined;
    pinRetries: number | undefined;
    powerCycleState: boolean | undefined;
    uvRetries: number | undefined;

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        let map: Map<number, number | boolean | Buffer | Map<number, number | Buffer>>;
        try {
            map = decodeFirstSync(payload);
        } catch (e) {
            throw new Ctap2ErrInvalidCbor();
        }
        if (map.get(Ctap2ClientPinNameRes.keyAgreement)) this.keyAgreement = new COSEKey().deserialize(map.get(Ctap2ClientPinNameRes.keyAgreement) as Map<number, number | Buffer>);
        this.pinUvAuthToken = map.get(Ctap2ClientPinNameRes.pinUvAuthToken) as Buffer;
        this.pinRetries = map.get(Ctap2ClientPinNameRes.pinRetries) as number;
        this.powerCycleState = map.get(Ctap2ClientPinNameRes.powerCycleState) as boolean;
        this.uvRetries = map.get(Ctap2ClientPinNameRes.uvRetries) as number;
        return this;
    }
}