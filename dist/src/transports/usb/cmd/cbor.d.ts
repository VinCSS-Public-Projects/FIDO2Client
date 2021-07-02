/// <reference types="node" />
import { CtapStatusCode } from "../../../ctap2/status";
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";
export declare const CtapHidCborCmd = 16;
export declare class CtapHidCborReq implements IUsbCmd {
    cmd: number;
    data: Buffer;
    constructor(cmd: number, data: Buffer);
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidCborRes implements IUsbCmd {
    code: CtapStatusCode;
    data: Buffer;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
