import { Payload } from "../../transport";
import { BleCmd } from "../ble";

export const CtapBlePingCmd = 0x81;

export class CtapBlePingReq implements BleCmd {
    data: Buffer;

    constructor(data: Buffer) {
        this.data = data;
    }

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        return { cmd: CtapBlePingCmd, data: this.data };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapBlePingRes implements BleCmd {
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