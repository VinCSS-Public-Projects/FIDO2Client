/// <reference types="node" />
import { ClientPinVersion } from "../../../environment";
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { COSEKey } from "../client-pin";
export declare const Ctap2ClientPinCmd = 6;
export declare enum ClientPinSubCommand {
    getPinRetries = 1,
    getKeyAgreement = 2,
    setPin = 3,
    changePin = 4,
    getPinToken = 5,
    getPinUvAuthTokenUsingUvWithPermissions = 6,
    getUVRetries = 7,
    getPinUvAuthTokenUsingPinWithPermissions = 9
}
export declare enum Ctap2ClientPinNameReq {
    pinUvAuthProtocol = 1,
    subCommand = 2,
    keyAgreement = 3,
    pinUvAuthParam = 4,
    newPinEnc = 5,
    pinHashEnc = 6,
    permissions = 9,
    permissionsRpId = 10
}
export declare enum Ctap2ClientPinNameRes {
    keyAgreement = 1,
    pinUvAuthToken = 2,
    pinRetries = 3,
    powerCycleState = 4,
    uvRetries = 5
}
export declare class Ctap2ClientPinReq implements ICtap2Cmd {
    pinUvAuthProtocol: number;
    subCommand: ClientPinSubCommand;
    keyAgreement: COSEKey | undefined;
    pinUvAuthParam: Buffer | undefined;
    newPinEnc: Buffer | undefined;
    pinHashEnc: Buffer | undefined;
    permissions: Permissions | undefined;
    permissionsRpId: string | undefined;
    constructor();
    initialize(pinUvAuthProtocol: ClientPinVersion, subCommand: ClientPinSubCommand, keyAgreement?: COSEKey, pinUvAuthParam?: Buffer, newPinEnc?: Buffer, pinHashEnc?: Buffer, permissions?: Permissions, permissionsRpId?: string): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Ctap2ClientPinRes implements ICtap2Cmd {
    keyAgreement: COSEKey | undefined;
    pinUvAuthToken: Buffer | undefined;
    pinRetries: number | undefined;
    powerCycleState: boolean | undefined;
    uvRetries: number | undefined;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
