"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapNfcKeepAliveRes = exports.CtapNfcKeepAliveReq = exports.CtapNfcKeepAliveCmd = void 0;
/**
 * @TODO define NFC command value
 */
exports.CtapNfcKeepAliveCmd = 0x9100;
class CtapNfcKeepAliveReq {
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
exports.CtapNfcKeepAliveReq = CtapNfcKeepAliveReq;
class CtapNfcKeepAliveRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.status = payload.readUInt8(0);
        return this;
    }
}
exports.CtapNfcKeepAliveRes = CtapNfcKeepAliveRes;
//# sourceMappingURL=keep-alive.js.map