"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapBleErrorRes = exports.CtapBleErrorReq = exports.CtapBleErrorCode = exports.CtapBleErrorCmd = void 0;
exports.CtapBleErrorCmd = 0xbf;
var CtapBleErrorCode;
(function (CtapBleErrorCode) {
    CtapBleErrorCode[CtapBleErrorCode["InvalidCmd"] = 1] = "InvalidCmd";
    CtapBleErrorCode[CtapBleErrorCode["InvalidPar"] = 2] = "InvalidPar";
    CtapBleErrorCode[CtapBleErrorCode["InvalidLen"] = 3] = "InvalidLen";
    CtapBleErrorCode[CtapBleErrorCode["InvalidSeq"] = 4] = "InvalidSeq";
    CtapBleErrorCode[CtapBleErrorCode["ReqTimeout"] = 5] = "ReqTimeout";
    CtapBleErrorCode[CtapBleErrorCode["Busy"] = 6] = "Busy";
    // LockRequired = 0xa,
    // InvalidChannel = 0xb,
    CtapBleErrorCode[CtapBleErrorCode["Other"] = 127] = "Other";
})(CtapBleErrorCode = exports.CtapBleErrorCode || (exports.CtapBleErrorCode = {}));
class CtapBleErrorReq {
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
exports.CtapBleErrorReq = CtapBleErrorReq;
class CtapBleErrorRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        this.code = payload.readUInt8(0);
        return this;
    }
}
exports.CtapBleErrorRes = CtapBleErrorRes;
