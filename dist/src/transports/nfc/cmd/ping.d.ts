/// <reference types="node" />
import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";
/**
 * @TODO define NFC command value
 */
export declare const CtapNfcPingCmd = 4;
export declare class CtapNfcPingReq implements NfcCmd {
    data: Buffer;
    initialize(data: Buffer): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class CtapNfcPingRes implements NfcCmd {
    data: Buffer;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
