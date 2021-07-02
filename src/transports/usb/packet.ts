import { UsbInvalidPacketLength } from "../../errors/usb";

export const CtapHidChannelBusy = Buffer.alloc(1, 0x6);
export const CtapHidBroadcastCid = Buffer.alloc(4, 0xff);

export class CtapHidInitPacket {
    cid!: Buffer;
    cmd!: number;
    length!: number;
    data!: Buffer;

    constructor(
        private maxPacketLength: number
    ) { }

    initialize(cid: Buffer, cmd: number, length: number, data: Buffer): this {
        this.cid = cid;
        this.cmd = cmd;
        this.length = length;
        this.data = data;
        return this;
    }

    serialize(): Buffer {
        let result = Buffer.alloc(this.maxPacketLength);
        let offset = 0;
        offset += this.cid.copy(result, offset);
        offset = result.writeUInt8(this.cmd | 0x80, offset);
        offset = result.writeUInt16BE(this.length, offset);
        offset += this.data.copy(result, offset);
        return result;
    }

    deserialize(payload: Buffer): this {
        if (this.maxPacketLength !== payload.length) { throw new UsbInvalidPacketLength(); }
        this.cid = payload.slice(0, 4);
        this.cmd = payload[4] & 0x7f;
        this.length = payload.readUInt16BE(5);
        this.data = payload.slice(7, 7 + this.length);
        return this;
    }
}

export class CtapHidContinuationPacket {
    cid!: Buffer;
    sequence!: number;
    data!: Buffer;
    constructor(
        private maxPacketLength: number
    ) { }

    initialize(cid: Buffer, sequence: number, data: Buffer): this {
        this.cid = cid;
        this.sequence = sequence & 0x7f;
        this.data = data;
        return this;
    }

    serialize(): Buffer {
        let result = Buffer.alloc(this.maxPacketLength);
        let offset = 0;
        offset += this.cid.copy(result, offset);
        offset = result.writeUInt8(this.sequence, offset);
        offset += this.data.copy(result, offset);
        return result;
    }

    deserialize(payload: Buffer): void {
        if (this.maxPacketLength !== payload.length) { throw new UsbInvalidPacketLength(); }
        this.cid = payload.slice(0, 4);
        this.sequence = payload[4];
        this.data = payload.slice(5);
    }
}