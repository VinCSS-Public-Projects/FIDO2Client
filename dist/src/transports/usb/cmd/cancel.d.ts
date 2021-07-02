/// <reference types="node" />
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";
export declare const CtapHidCancelCmd = 17;
export declare class CtapHidCancelReq implements IUsbCmd {
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidCancelRes implements IUsbCmd {
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
