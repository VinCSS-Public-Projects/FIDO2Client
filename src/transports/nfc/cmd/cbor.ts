import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";

/**
 * @TODO define NFC command value
 */
export const CtapNfcCborCmd = 0x9000;

export class CtapNfcCborReq implements NfcCmd {
    cmd!: number;
    data!: Buffer;

    initialize(cmd: number, data: Buffer): this {
        this.cmd = cmd;
        this.data = data;
        return this;
    }
    serialize(): Payload {
        let result = Buffer.alloc(this.data.length + 1);
        let offset = 0;
        offset = result.writeUInt8(this.cmd, offset);
        offset += this.data.copy(result, offset);
        return { cmd: CtapNfcCborCmd, data: result };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapNfcCborRes implements NfcCmd {
    code!: number;
    data!: Buffer

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.code = payload.readUInt8(0);
        this.data = payload.slice(1);
        return this;
    }
}