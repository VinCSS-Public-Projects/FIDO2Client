"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidPingRes = exports.CtapHidPingReq = exports.CtapHidPingCmd = void 0;
exports.CtapHidPingCmd = 0x1;
class CtapHidPingReq {
    constructor(data) {
        this.data = data;
    }
    serialize() {
        return { cmd: exports.CtapHidPingCmd, data: this.data };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidPingReq = CtapHidPingReq;
class CtapHidPingRes {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.data = Buffer.alloc(payload.length);
        payload.copy(this.data, 0, 0);
        return this;
    }
}
exports.CtapHidPingRes = CtapHidPingRes;
//# sourceMappingURL=ping.js.map