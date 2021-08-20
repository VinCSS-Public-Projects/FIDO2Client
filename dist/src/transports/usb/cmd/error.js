"use strict";
/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#usb-hid-error
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapHidErrorRes = exports.CtapHidErrorReq = exports.CtapHidErrorCode = exports.CtapHidErrorCmd = void 0;
exports.CtapHidErrorCmd = 0x3f;
var CtapHidErrorCode;
(function (CtapHidErrorCode) {
    CtapHidErrorCode[CtapHidErrorCode["InvalidCmd"] = 1] = "InvalidCmd";
    CtapHidErrorCode[CtapHidErrorCode["InvalidPar"] = 2] = "InvalidPar";
    CtapHidErrorCode[CtapHidErrorCode["InvalidLen"] = 3] = "InvalidLen";
    CtapHidErrorCode[CtapHidErrorCode["InvalidSeq"] = 4] = "InvalidSeq";
    CtapHidErrorCode[CtapHidErrorCode["MsgTimeout"] = 5] = "MsgTimeout";
    CtapHidErrorCode[CtapHidErrorCode["ChannelBusy"] = 6] = "ChannelBusy";
    CtapHidErrorCode[CtapHidErrorCode["LockRequired"] = 10] = "LockRequired";
    CtapHidErrorCode[CtapHidErrorCode["InvalidChannel"] = 11] = "InvalidChannel";
    CtapHidErrorCode[CtapHidErrorCode["Other"] = 127] = "Other";
})(CtapHidErrorCode = exports.CtapHidErrorCode || (exports.CtapHidErrorCode = {}));
class CtapHidErrorReq {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.CtapHidErrorReq = CtapHidErrorReq;
class CtapHidErrorRes {
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.code = payload.readUInt8(0);
        return this;
    }
}
exports.CtapHidErrorRes = CtapHidErrorRes;
//# sourceMappingURL=error.js.map