"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceInfo = void 0;
const bindings_1 = __importDefault(require("bindings"));
const usb = bindings_1.default('usb-hid.node');
function deviceInfo(devicePath) {
    return usb.device(devicePath);
}
exports.deviceInfo = deviceInfo;
//# sourceMappingURL=index.js.map