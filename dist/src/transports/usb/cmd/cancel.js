"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidCancelRes = exports.CtapHidCancelReq = exports.CtapHidCancelCmd = void 0;
exports.CtapHidCancelCmd = 0x11;
class CtapHidCancelReq {
    serialize() {
        return { cmd: exports.CtapHidCancelCmd, data: Buffer.alloc(0) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidCancelReq = CtapHidCancelReq;
class CtapHidCancelRes {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidCancelRes = CtapHidCancelRes;
//# sourceMappingURL=cancel.js.map