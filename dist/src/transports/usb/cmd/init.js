"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidInitRes = exports.CtapHidInitReq = void 0;
/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#usb-hid-init
 */
const CtapHidInitCmd = 0x6;
class CtapHidInitReq {
    constructor(nonce) {
        this.nonce = nonce;
    }
    serialize() {
        return { cmd: CtapHidInitCmd, data: this.nonce };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidInitReq = CtapHidInitReq;
class CtapHidInitRes {
    constructor() { }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.nonce = payload.slice(0, 8);
        this.cid = payload.slice(8, 12);
        this.ctapVersion = payload[12];
        this.deviceMajor = payload[13];
        this.deviceMinor = payload[14];
        this.deviceBuild = payload[15];
        this.deviceCapabilities = payload[16];
        return this;
    }
}
exports.CtapHidInitRes = CtapHidInitRes;
//# sourceMappingURL=init.js.map