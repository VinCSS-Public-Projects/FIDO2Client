import { Payload } from "../../transport";
import { NfcCmd } from "../nfc";

export const CtapNfcPingCmd = 0x1;

export class CtapNfcPingReq implements NfcCmd {
    data!: Buffer;

    initialize(data: Buffer): this {
        this.data = data;
        return this;
    }
    serialize(): Payload {
        return { cmd: CtapNfcPingCmd, data: this.data };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapNfcPingRes implements NfcCmd {
    data!: Buffer;

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.data = Buffer.alloc(payload.length);
        payload.copy(this.data);
        return this;
    }
}