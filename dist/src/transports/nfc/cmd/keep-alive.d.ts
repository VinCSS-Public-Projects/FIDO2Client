/// <reference types="node" />
import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";
export declare const CtapNfcKeepAliveCmd = 130;
export declare class CtapNfcKeepAliveReq implements NfcCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapNfcKeepAliveRes implements NfcCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
