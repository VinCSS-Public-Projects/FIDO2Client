"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapBleCancelRes = exports.CtapBleCancelReq = exports.CtapBleCancelCmd = void 0;
exports.CtapBleCancelCmd = 0xbe;
class CtapBleCancelReq {
    initialize() {
        return this;
    }
    serialize() {
        return { cmd: exports.CtapBleCancelCmd, data: Buffer.alloc(0) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapBleCancelReq = CtapBleCancelReq;
class CtapBleCancelRes {
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
exports.CtapBleCancelRes = CtapBleCancelRes;
//# sourceMappingURL=cancel.js.map