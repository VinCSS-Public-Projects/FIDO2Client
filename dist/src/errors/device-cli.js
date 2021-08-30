"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceCliTransactionNotFound = exports.DeviceCliCanNotOpen = exports.DeviceCliNotResponding = exports.DeviceCliNotInitialized = exports.DeviceCliTransportUnsupported = void 0;
class DeviceCliTransportUnsupported extends Error {
}
exports.DeviceCliTransportUnsupported = DeviceCliTransportUnsupported;
class DeviceCliNotInitialized extends Error {
}
exports.DeviceCliNotInitialized = DeviceCliNotInitialized;
class DeviceCliNotResponding extends Error {
}
exports.DeviceCliNotResponding = DeviceCliNotResponding;
class DeviceCliCanNotOpen extends Error {
}
exports.DeviceCliCanNotOpen = DeviceCliCanNotOpen;
class DeviceCliTransactionNotFound extends Error {
}
exports.DeviceCliTransactionNotFound = DeviceCliTransactionNotFound;
//# sourceMappingURL=device-cli.js.map