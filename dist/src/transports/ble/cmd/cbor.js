"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapBleCborRes = exports.CtapBleCborReq = exports.CtapBleCborCmd = void 0;
exports.CtapBleCborCmd = 0x83;
class CtapBleCborReq {
    initialize(cmd, data) {
        this.cmd = cmd;
        this.data = data;
        return this;
    }
    serialize() {
        let result = Buffer.alloc(this.data.length + 1);
        let offset = 0;
        offset = result.writeUInt8(this.cmd, offset);
        offset += this.data.copy(result, offset);
        return { cmd: exports.CtapBleCborCmd, data: result };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapBleCborReq = CtapBleCborReq;
class CtapBleCborRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.code = payload.readUInt8(0);
        this.data = payload.slice(1);
        return this;
    }
}
exports.CtapBleCborRes = CtapBleCborRes;
