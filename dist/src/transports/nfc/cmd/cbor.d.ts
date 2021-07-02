/// <reference types="node" />
import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";
export declare const CtapNfcCborCmd = 16;
export declare class CtapNfcCborReq implements NfcCmd {
    cmd: number;
    data: Buffer;
    initialize(cmd: number, data: Buffer): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapNfcCborRes implements NfcCmd {
    code: number;
    data: Buffer;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
