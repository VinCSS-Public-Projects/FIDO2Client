/// <reference types="node" />
import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";
export declare const CtapNfcErrorCmd = 191;
export declare enum CtapNfcErrorCode {
    InvalidCmd = 1,
    InvalidPar = 2,
    InvalidLen = 3,
    InvalidSeq = 4,
    ReqTimeout = 5,
    Busy = 6,
    Other = 127
}
export declare class CtapNfcErrorReq implements NfcCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapNfcErrorRes implements NfcCmd {
    code: number;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
