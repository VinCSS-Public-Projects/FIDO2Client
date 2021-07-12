import { MethodNotImplemented } from "../errors/common";

/**
 * @deprecated
 * TODO: use built-in Buffer base64url encoder
 */
export class Base64 {
    static encode(data: Buffer): string {
        return data.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }
    static decode(data: string): Buffer {
        throw new MethodNotImplemented();
    }
}