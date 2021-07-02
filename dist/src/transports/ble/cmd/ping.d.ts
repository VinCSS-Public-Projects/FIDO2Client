/// <reference types="node" />
import { Payload } from "../../transport";
import { BleCmd } from "../ble";
export declare const CtapBlePingCmd = 129;
export declare class CtapBlePingReq implements BleCmd {
    data: Buffer;
    constructor(data: Buffer);
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapBlePingRes implements BleCmd {
    data: Buffer;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
