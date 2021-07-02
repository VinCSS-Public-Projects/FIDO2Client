/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#usb-hid-error
 */
/// <reference types="node" />
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";
export declare const CtapHidErrorCmd = 63;
export declare enum CtapHidErrorCode {
    InvalidCmd = 1,
    InvalidPar = 2,
    InvalidLen = 3,
    InvalidSeq = 4,
    MsgTimeout = 5,
    ChannelBusy = 6,
    LockRequired = 10,
    InvalidChannel = 11,
    Other = 127
}
export declare class CtapHidErrorReq implements IUsbCmd {
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidErrorRes implements IUsbCmd {
    code: CtapHidErrorCode;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
