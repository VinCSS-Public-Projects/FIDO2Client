/// <reference types="node" />
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";
export declare const CtapHidPingCmd = 1;
export declare class CtapHidPingReq implements IUsbCmd {
    data: Buffer;
    constructor(data: Buffer);
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidPingRes implements IUsbCmd {
    data: Buffer;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
