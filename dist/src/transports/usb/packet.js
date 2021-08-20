"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidContinuationPacket = exports.CtapHidInitPacket = exports.CtapHidBroadcastCid = exports.CtapHidChannelBusy = void 0;
const usb_1 = require("../../errors/usb");
exports.CtapHidChannelBusy = Buffer.alloc(1, 0x6);
exports.CtapHidBroadcastCid = Buffer.alloc(4, 0xff);
class CtapHidInitPacket {
    constructor(maxPacketLength) {
        this.maxPacketLength = maxPacketLength;
    }
    initialize(cid, cmd, length, data) {
        this.cid = cid;
        this.cmd = cmd;
        this.length = length;
        this.data = data;
        return this;
    }
    serialize() {
        let result = Buffer.alloc(this.maxPacketLength);
        let offset = 0;
        offset += this.cid.copy(result, offset);
        offset = result.writeUInt8(this.cmd | 0x80, offset);
        offset = result.writeUInt16BE(this.length, offset);
        offset += this.data.copy(result, offset);
        return result;
    }
    deserialize(payload) {
        if (this.maxPacketLength !== payload.length) {
            throw new usb_1.UsbInvalidPacketLength();
        }
        this.cid = payload.slice(0, 4);
        this.cmd = payload[4] & 0x7f;
        this.length = payload.readUInt16BE(5);
        this.data = payload.slice(7, 7 + this.length);
        return this;
    }
}
exports.CtapHidInitPacket = CtapHidInitPacket;
class CtapHidContinuationPacket {
    constructor(maxPacketLength) {
        this.maxPacketLength = maxPacketLength;
    }
    initialize(cid, sequence, data) {
        this.cid = cid;
        this.sequence = sequence & 0x7f;
        this.data = data;
        return this;
    }
    serialize() {
        let result = Buffer.alloc(this.maxPacketLength);
        let offset = 0;
        offset += this.cid.copy(result, offset);
        offset = result.writeUInt8(this.sequence, offset);
        offset += this.data.copy(result, offset);
        return result;
    }
    deserialize(payload) {
        if (this.maxPacketLength !== payload.length) {
            throw new usb_1.UsbInvalidPacketLength();
        }
        this.cid = payload.slice(0, 4);
        this.sequence = payload[4];
        this.data = payload.slice(5);
    }
}
exports.CtapHidContinuationPacket = CtapHidContinuationPacket;
//# sourceMappingURL=packet.js.map