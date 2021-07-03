/// <reference types="node" />
import { Payload } from "../../transport";
import { BleCmd } from "../ble";
export declare const CtapBleCancelCmd = 190;
export declare class CtapBleCancelReq implements BleCmd {
    initialize(): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapBleCancelRes implements BleCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
