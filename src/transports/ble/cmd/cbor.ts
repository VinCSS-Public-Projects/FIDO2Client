import { Payload } from "../../transport";
import { BleCmd } from "../ble";

export const CtapBleCborCmd = 0x83;

export class CtapBleCborReq implements BleCmd {
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
        return { cmd: CtapBleCborCmd, data: result };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapBleCborRes implements BleCmd {
    code!: number;
    data!: Buffer;

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