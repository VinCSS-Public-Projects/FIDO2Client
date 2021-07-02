/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#usb-hid-error
 */

import { Ctap2InvalidCommand } from "../../../errors/ctap2";
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";

export const CtapHidErrorCmd = 0x3f;

export enum CtapHidErrorCode {
    InvalidCmd = 0x1,
    InvalidPar = 0x2,
    InvalidLen = 0x3,
    InvalidSeq = 0x4,
    MsgTimeout = 0x5,
    ChannelBusy = 0x6,
    LockRequired = 0xa,
    InvalidChannel = 0xb,
    Other = 0x7f
}

export class CtapHidErrorReq implements IUsbCmd {
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }

}

export class CtapHidErrorRes implements IUsbCmd {
    code!: CtapHidErrorCode;

    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.code = payload.readUInt8(0);
        return this;
    }
}