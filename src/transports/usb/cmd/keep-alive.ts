import { Ctap2InvalidCommand } from "../../../errors/ctap2";
import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";

export const CtapHidKeepAliveCmd = 0x3b;

export enum CtapHidKeepAliveStatusCode {
    Processing = 0x1,
    UpNeeded = 0x2
}

export class CtapHidKeepAliveReq implements IUsbCmd {
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapHidKeepAliveRes implements IUsbCmd {
    code!: CtapHidKeepAliveStatusCode;

    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.code = payload.readUInt8(0);
        return this;
    }
}