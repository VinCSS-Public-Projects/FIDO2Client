import { CtapStatusCode } from "../../../ctap2/status";
import { Ctap2InvalidCommand } from "../../../errors/ctap2";
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";

export const CtapHidCborCmd = 0x10;

export class CtapHidCborReq implements IUsbCmd {
    constructor(
        public cmd: number,
        public data: Buffer
    ) { }

    serialize(): Payload {
        let result = Buffer.alloc(this.data.length + 1);
        let offset = 0;
        offset = result.writeUInt8(this.cmd, offset);
        offset += this.data.copy(result, offset);
        return { cmd: CtapHidCborCmd, data: result };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapHidCborRes implements IUsbCmd {
    code!: CtapStatusCode;
    data!: Buffer;

    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        let code = payload.readUInt8(0);
        let data = payload.slice(1);
        this.code = code;
        this.data = data;
        return this;
    }
}