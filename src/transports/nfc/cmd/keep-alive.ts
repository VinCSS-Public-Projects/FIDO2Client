import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";

/**
 * @TODO define NFC command value
 */
export const CtapNfcKeepAliveCmd = 0x9100;

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
    status!: number;

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.status = payload.readUInt8(0);
        return this;
    }
}