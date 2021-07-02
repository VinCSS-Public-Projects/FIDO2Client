/// <reference types="node" />
import { Payload } from "../../transport";
import { BleCmd } from "../ble";
export declare const CtapBleKeepAliveCmd = 130;
export declare enum CtapBleKeepAliveStatusCode {
    Processing = 1,
    UpNeeded = 2
}
export declare class CtapBleKeepAliveReq implements BleCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapBleKeepAliveRes implements BleCmd {
    status: CtapBleKeepAliveStatusCode;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
