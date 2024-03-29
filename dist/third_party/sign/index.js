"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const bindings_1 = __importDefault(require("bindings"));
const sign = bindings_1.default('sign.node');
function verify(filepath = process.execPath) {
    return sign.verify(filepath);
}
exports.verify = verify;
//# sourceMappingURL=index.js.map