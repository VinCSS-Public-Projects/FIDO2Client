"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapBlePingRes = exports.CtapBlePingReq = exports.CtapBlePingCmd = void 0;
exports.CtapBlePingCmd = 0x81;
class CtapBlePingReq {
    constructor(data) {
        this.data = data;
    }
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        return { cmd: exports.CtapBlePingCmd, data: this.data };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapBlePingReq = CtapBlePingReq;
class CtapBlePingRes {
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
exports.CtapBlePingRes = CtapBlePingRes;
//# sourceMappingURL=ping.js.map