/// <reference types="node" />
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
export declare const Ctap2GetNextAssertionCmd = 8;
export declare class Ctap2GetNextAssertionReq implements ICtap2Cmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Ctap2GetNextAssertionRes implements ICtap2Cmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
