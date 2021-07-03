import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";

export const CtapHidCancelCmd = 0x11;

export class CtapHidCancelReq implements IUsbCmd {
    serialize(): Payload {
        return { cmd: CtapHidCancelCmd, data: Buffer.alloc(0) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapHidCancelRes implements IUsbCmd {
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}