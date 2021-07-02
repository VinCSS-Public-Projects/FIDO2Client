"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BleDeviceNotFound = exports.BleInvalidPacketSequence = exports.BleUnsupportedOnPlatform = exports.BleDeviceNotCompatibleFido = void 0;
class BleDeviceNotCompatibleFido extends Error {
}
exports.BleDeviceNotCompatibleFido = BleDeviceNotCompatibleFido;
class BleUnsupportedOnPlatform extends Error {
}
exports.BleUnsupportedOnPlatform = BleUnsupportedOnPlatform;
class BleInvalidPacketSequence extends Error {
}
exports.BleInvalidPacketSequence = BleInvalidPacketSequence;
class BleDeviceNotFound extends Error {
}
exports.BleDeviceNotFound = BleDeviceNotFound;
