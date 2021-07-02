import { Payload } from "../../transport";
import { BleCmd } from "../ble";

export const CtapBleCancelCmd = 0x81;

export class CtapBleCancelReq implements BleCmd {
    initialize(): this {
        return this;
    }
    serialize(): Payload {
        return { cmd: CtapBleCancelCmd, data: Buffer.alloc(0) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapBleCancelRes implements BleCmd {
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