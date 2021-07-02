import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";

export const CtapNfcKeepAliveCmd = 0x82;

export class CtapNfcKeepAliveReq implements NfcCmd {
    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapNfcKeepAliveRes implements NfcCmd {
    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}