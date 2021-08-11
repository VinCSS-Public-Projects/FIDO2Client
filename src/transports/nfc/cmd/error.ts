import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";

/**
 * @TODO define NFC command value
 */
export const CtapNfcErrorCmd = 0x2;

export enum CtapNfcErrorCode {
    InvalidCmd = 0x1,
    InvalidPar = 0x2,
    InvalidLen = 0x3,
    InvalidSeq = 0x4,
    ReqTimeout = 0x5,
    Busy = 0x6,
    // LockRequired = 0xa,
    // InvalidChannel = 0xb,
    Other = 0x7f
}

export class CtapNfcErrorReq implements NfcCmd {
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
export class CtapNfcErrorRes implements NfcCmd {
    code!: number;

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.code = payload.readUInt8(0);
        return this;
    }
}