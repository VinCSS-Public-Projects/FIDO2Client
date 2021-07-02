"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsbDeviceNotCompatibleFido = exports.UsbUnsupportedOnPlatform = exports.UsbInvalidChannelId = exports.UsbInvalidPacketSequence = exports.UsbInvalidPacketLength = exports.UsbCmdInitNonceMismatch = exports.UsbCmdInitInvalidLength = exports.UsbCmdMismatch = exports.UsbDeviceBusy = void 0;
class UsbDeviceBusy extends Error {
}
exports.UsbDeviceBusy = UsbDeviceBusy;
class UsbCmdMismatch extends Error {
}
exports.UsbCmdMismatch = UsbCmdMismatch;
class UsbCmdInitInvalidLength extends Error {
}
exports.UsbCmdInitInvalidLength = UsbCmdInitInvalidLength;
class UsbCmdInitNonceMismatch extends Error {
}
exports.UsbCmdInitNonceMismatch = UsbCmdInitNonceMismatch;
class UsbInvalidPacketLength extends Error {
}
exports.UsbInvalidPacketLength = UsbInvalidPacketLength;
class UsbInvalidPacketSequence extends Error {
}
exports.UsbInvalidPacketSequence = UsbInvalidPacketSequence;
class UsbInvalidChannelId extends Error {
}
exports.UsbInvalidChannelId = UsbInvalidChannelId;
class UsbUnsupportedOnPlatform extends Error {
}
exports.UsbUnsupportedOnPlatform = UsbUnsupportedOnPlatform;
class UsbDeviceNotCompatibleFido extends Error {
}
exports.UsbDeviceNotCompatibleFido = UsbDeviceNotCompatibleFido;
