"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidCborRes = exports.CtapHidCborReq = exports.CtapHidCborCmd = void 0;
exports.CtapHidCborCmd = 0x10;
class CtapHidCborReq {
    constructor(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
    serialize() {
        let result = Buffer.alloc(this.data.length + 1);
        let offset = 0;
        offset = result.writeUInt8(this.cmd, offset);
        offset += this.data.copy(result, offset);
        return { cmd: exports.CtapHidCborCmd, data: result };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidCborReq = CtapHidCborReq;
class CtapHidCborRes {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        let code = payload.readUInt8(0);
        let data = payload.slice(1);
        this.code = code;
        this.data = data;
        return this;
    }
}
exports.CtapHidCborRes = CtapHidCborRes;
//# sourceMappingURL=cbor.js.map