import { Payload } from "../../transport";
import { BleCmd } from "../ble";

export const CtapBleKeepAliveCmd = 0x82;

export enum CtapBleKeepAliveStatusCode {
    Processing = 0x1,
    UpNeeded = 0x2
}

export class CtapBleKeepAliveReq implements BleCmd {
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
export class CtapBleKeepAliveRes implements BleCmd {
    status!: CtapBleKeepAliveStatusCode;
    
    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.status = payload.readUInt8(0);
        return this;
    }
}