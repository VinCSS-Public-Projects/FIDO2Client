"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FragmentRes = exports.FragmentReq = exports.InstructionCode = exports.InstructionClass = void 0;
const nfc_1 = require("../../errors/nfc");
/**
 * @TODO rename instruction class.
 */
var InstructionClass;
(function (InstructionClass) {
    InstructionClass[InstructionClass["Unknown"] = 0] = "Unknown";
    InstructionClass[InstructionClass["Command"] = 128] = "Command";
    InstructionClass[InstructionClass["Chaining"] = 144] = "Chaining";
})(InstructionClass = exports.InstructionClass || (exports.InstructionClass = {}));
/**
 * @TODO rename instruction code.
 */
var InstructionCode;
(function (InstructionCode) {
    InstructionCode[InstructionCode["Select"] = 164] = "Select";
    InstructionCode[InstructionCode["NfcCtapMsg"] = 16] = "NfcCtapMsg";
    InstructionCode[InstructionCode["NfcCtapPing"] = 1] = "NfcCtapPing";
    InstructionCode[InstructionCode["NfcCtapGetResponse"] = 17] = "NfcCtapGetResponse";
    InstructionCode[InstructionCode["NfcCtapUnknown"] = 192] = "NfcCtapUnknown";
    InstructionCode[InstructionCode["NfcCtapControl"] = 18] = "NfcCtapControl";
})(InstructionCode = exports.InstructionCode || (exports.InstructionCode = {}));
class FragmentReq {
    initialize(cla, ins, p1, p2, data, le) {
        if (data && data.length > 0xffff)
            throw new nfc_1.NfcFragmentTooLarge();
        this.cla = cla;
        this.ins = ins;
        this.p1 = p1;
        this.p2 = p2;
        this.lc = data ? data.length : 0;
        this.data = data;
        this.le = le || 0x80;
        return this;
    }
    serialize() {
        let size = this.lc + 4 + (this.lc ? 1 : 0) + (this.le ? 1 : 0);
        let fragment = Buffer.alloc(size);
        let offset = 0;
        offset = fragment.writeUInt8(this.cla, offset);
        offset = fragment.writeUInt8(this.ins, offset);
        offset = fragment.writeUInt8(this.p1, offset);
        offset = fragment.writeUInt8(this.p2, offset);
        if (this.lc !== 0 && this.data) {
            offset = fragment.writeUInt8(this.lc, offset);
            offset += this.data.copy(fragment, offset, 0);
        }
        offset = fragment.writeUInt8(this.le, offset);
        return fragment;
    }
    deserialize(payload) {
        return this;
    }
}
exports.FragmentReq = FragmentReq;
class FragmentRes {
    deserialize(payload) {
        /**
         * Offset to determine data and status.
         */
        let offset = payload.length - 2;
        /**
         * Last two bytes is the status.
         */
        this.status = payload.readUInt16BE(offset);
        /**
         * Copy data from payload.
         */
        this.data = Buffer.alloc(offset);
        payload.copy(this.data, 0, 0, offset);
        return this;
    }
}
exports.FragmentRes = FragmentRes;
