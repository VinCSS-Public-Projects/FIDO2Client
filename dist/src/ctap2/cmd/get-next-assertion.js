"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2GetNextAssertionRes = exports.Ctap2GetNextAssertionReq = exports.Ctap2GetNextAssertionCmd = void 0;
exports.Ctap2GetNextAssertionCmd = 0x8;
class Ctap2GetNextAssertionReq {
    initialize(...args) {
        return this;
    }
    serialize() {
        return { cmd: exports.Ctap2GetNextAssertionCmd, data: Buffer.alloc(0) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2GetNextAssertionReq = Ctap2GetNextAssertionReq;
class Ctap2GetNextAssertionRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2GetNextAssertionRes = Ctap2GetNextAssertionRes;
