/// <reference types="node" />
import { Payload } from "../../transport";
import { BleCmd } from "../ble";
export declare const CtapBleCborCmd = 131;
export declare class CtapBleCborReq implements BleCmd {
    cmd: number;
    data: Buffer;
    initialize(cmd: number, data: Buffer): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapBleCborRes implements BleCmd {
    code: number;
    data: Buffer;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
