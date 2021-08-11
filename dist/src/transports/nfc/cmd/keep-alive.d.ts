/// <reference types="node" />
import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";
/**
 * @TODO define NFC command value
 */
export declare const CtapNfcKeepAliveCmd = 37120;
export declare class CtapNfcKeepAliveReq implements NfcCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapNfcKeepAliveRes implements NfcCmd {
    status: number;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
