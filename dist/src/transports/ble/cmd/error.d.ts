/// <reference types="node" />
import { Payload } from "../../transport";
import { BleCmd } from "../ble";
export declare const CtapBleErrorCmd = 191;
export declare enum CtapBleErrorCode {
    InvalidCmd = 1,
    InvalidPar = 2,
    InvalidLen = 3,
    InvalidSeq = 4,
    ReqTimeout = 5,
    Busy = 6,
    Other = 127
}
export declare class CtapBleErrorReq implements BleCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapBleErrorRes implements BleCmd {
    code: CtapBleErrorCode;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
