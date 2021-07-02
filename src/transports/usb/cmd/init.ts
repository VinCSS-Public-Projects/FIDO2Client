import { Payload } from "../../transport";
import { IUsbCmd } from "../usb";

/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#usb-hid-init
 */

const CtapHidInitCmd = 0x6;

export class CtapHidInitReq implements IUsbCmd {
    constructor(
        private nonce: Buffer
    ) { }
    serialize(): Payload {
        return { cmd: CtapHidInitCmd, data: this.nonce };
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class CtapHidInitRes implements IUsbCmd {
    nonce!: Buffer;
    cid!: Buffer;
    ctapVersion!: number;
    deviceMajor!: number;
    deviceMinor!: number;
    deviceBuild!: number;
    deviceCapabilities!: number;

    constructor() { }

    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        this.nonce = payload.slice(0, 8);
        this.cid = payload.slice(8, 12);
        this.ctapVersion = payload[12];
        this.deviceMajor = payload[13];
        this.deviceMinor = payload[14];
        this.deviceBuild = payload[15];
        this.deviceCapabilities = payload[16];
        return this;
    }
}