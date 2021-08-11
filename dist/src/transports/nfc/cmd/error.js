"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapNfcErrorRes = exports.CtapNfcErrorReq = exports.CtapNfcErrorCode = exports.CtapNfcErrorCmd = void 0;
/**
 * @TODO define NFC command value
 */
exports.CtapNfcErrorCmd = 0x2;
var CtapNfcErrorCode;
(function (CtapNfcErrorCode) {
    CtapNfcErrorCode[CtapNfcErrorCode["InvalidCmd"] = 1] = "InvalidCmd";
    CtapNfcErrorCode[CtapNfcErrorCode["InvalidPar"] = 2] = "InvalidPar";
    CtapNfcErrorCode[CtapNfcErrorCode["InvalidLen"] = 3] = "InvalidLen";
    CtapNfcErrorCode[CtapNfcErrorCode["InvalidSeq"] = 4] = "InvalidSeq";
    CtapNfcErrorCode[CtapNfcErrorCode["ReqTimeout"] = 5] = "ReqTimeout";
    CtapNfcErrorCode[CtapNfcErrorCode["Busy"] = 6] = "Busy";
    // LockRequired = 0xa,
    // InvalidChannel = 0xb,
    CtapNfcErrorCode[CtapNfcErrorCode["Other"] = 127] = "Other";
})(CtapNfcErrorCode = exports.CtapNfcErrorCode || (exports.CtapNfcErrorCode = {}));
class CtapNfcErrorReq {
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
exports.CtapNfcErrorReq = CtapNfcErrorReq;
class CtapNfcErrorRes {
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
exports.CtapNfcErrorRes = CtapNfcErrorRes;
