/// <reference types="node" />
/**
 * @deprecated
 * TODO: use built-in Buffer base64url encoder
 */
export declare class Base64 {
    static encode(data: Buffer): string;
    static decode(data: string): Buffer;
}
