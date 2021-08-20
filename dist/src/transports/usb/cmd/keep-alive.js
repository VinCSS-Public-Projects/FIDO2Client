"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidKeepAliveRes = exports.CtapHidKeepAliveReq = exports.CtapHidKeepAliveStatusCode = exports.CtapHidKeepAliveCmd = void 0;
exports.CtapHidKeepAliveCmd = 0x3b;
var CtapHidKeepAliveStatusCode;
(function (CtapHidKeepAliveStatusCode) {
    CtapHidKeepAliveStatusCode[CtapHidKeepAliveStatusCode["Processing"] = 1] = "Processing";
    CtapHidKeepAliveStatusCode[CtapHidKeepAliveStatusCode["UpNeeded"] = 2] = "UpNeeded";
})(CtapHidKeepAliveStatusCode = exports.CtapHidKeepAliveStatusCode || (exports.CtapHidKeepAliveStatusCode = {}));
class CtapHidKeepAliveReq {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidKeepAliveReq = CtapHidKeepAliveReq;
class CtapHidKeepAliveRes {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.code = payload.readUInt8(0);
        return this;
    }
}
exports.CtapHidKeepAliveRes = CtapHidKeepAliveRes;
//# sourceMappingURL=keep-alive.js.map