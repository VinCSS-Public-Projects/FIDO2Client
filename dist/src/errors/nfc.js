"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfcTransmitDataFailed = exports.NfcInvalidStatusCode = exports.NfcDeviceNotFound = exports.NfcFragmentTooLarge = void 0;
class NfcFragmentTooLarge extends Error {
}
exports.NfcFragmentTooLarge = NfcFragmentTooLarge;
class NfcDeviceNotFound extends Error {
}
exports.NfcDeviceNotFound = NfcDeviceNotFound;
class NfcInvalidStatusCode extends Error {
}
exports.NfcInvalidStatusCode = NfcInvalidStatusCode;
class NfcTransmitDataFailed extends Error {
}
exports.NfcTransmitDataFailed = NfcTransmitDataFailed;
//# sourceMappingURL=nfc.js.map