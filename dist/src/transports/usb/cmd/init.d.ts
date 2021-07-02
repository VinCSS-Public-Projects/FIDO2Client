/// <reference types="node" />
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";
export declare class CtapHidInitReq implements IUsbCmd {
    private nonce;
    constructor(nonce: Buffer);
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidInitRes implements IUsbCmd {
    nonce: Buffer;
    cid: Buffer;
    ctapVersion: number;
    deviceMajor: number;
    deviceMinor: number;
    deviceBuild: number;
    deviceCapabilities: number;
    constructor();
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
