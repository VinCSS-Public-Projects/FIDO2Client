/// <reference types="node" />
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";
export declare const CtapHidKeepAliveCmd = 59;
export declare enum CtapHidKeepAliveStatusCode {
    Processing = 1,
    UpNeeded = 2
}
export declare class CtapHidKeepAliveReq implements IUsbCmd {
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidKeepAliveRes implements IUsbCmd {
    code: CtapHidKeepAliveStatusCode;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
