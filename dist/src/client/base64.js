"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base64 = void 0;
const common_1 = require("../errors/common");
/**
 * @deprecated
 * TODO: use built-in Buffer base64url encoder
 */
class Base64 {
    static encode(data) {
        return data.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }
    static decode(data) {
        throw new common_1.MethodNotImplemented();
    }
}
exports.Base64 = Base64;
