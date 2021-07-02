import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";

export const CtapHidPingCmd = 0x1;

export class CtapHidPingReq implements IUsbCmd {
    constructor(
        public data: Buffer
    ) { }
    serialize(): Payload {
        return { cmd: CtapHidPingCmd, data: this.data };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapHidPingRes implements IUsbCmd {
    data!: Buffer;
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.data = Buffer.alloc(payload.length);
        payload.copy(this.data, 0, 0);
        return this;
    }
}