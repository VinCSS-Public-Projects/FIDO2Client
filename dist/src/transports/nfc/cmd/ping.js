"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapNfcPingRes = exports.CtapNfcPingReq = exports.CtapNfcPingCmd = void 0;
/**
 * @TODO define NFC command value
 */
exports.CtapNfcPingCmd = 0x4;
class CtapNfcPingReq {
    initialize(data) {
        this.data = data;
        return this;
    }
    serialize() {
        return { cmd: exports.CtapNfcPingCmd, data: this.data };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapNfcPingReq = CtapNfcPingReq;
class CtapNfcPingRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.data = Buffer.alloc(payload.length);
        payload.copy(this.data);
        return this;
    }
}
exports.CtapNfcPingRes = CtapNfcPingRes;
