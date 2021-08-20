"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapBleKeepAliveRes = exports.CtapBleKeepAliveReq = exports.CtapBleKeepAliveStatusCode = exports.CtapBleKeepAliveCmd = void 0;
exports.CtapBleKeepAliveCmd = 0x82;
var CtapBleKeepAliveStatusCode;
(function (CtapBleKeepAliveStatusCode) {
    CtapBleKeepAliveStatusCode[CtapBleKeepAliveStatusCode["Processing"] = 1] = "Processing";
    CtapBleKeepAliveStatusCode[CtapBleKeepAliveStatusCode["UpNeeded"] = 2] = "UpNeeded";
})(CtapBleKeepAliveStatusCode = exports.CtapBleKeepAliveStatusCode || (exports.CtapBleKeepAliveStatusCode = {}));
class CtapBleKeepAliveReq {
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
exports.CtapBleKeepAliveReq = CtapBleKeepAliveReq;
class CtapBleKeepAliveRes {
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
exports.CtapBleKeepAliveRes = CtapBleKeepAliveRes;
//# sourceMappingURL=keep-alive.js.map