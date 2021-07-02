import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";

export const Ctap2GetNextAssertionCmd = 0x8;

export class Ctap2GetNextAssertionReq implements ICtap2Cmd {
    initialize(...args: any[]): this {
        return this;
    }
    serialize(): Payload {
        return { cmd: Ctap2GetNextAssertionCmd, data: Buffer.alloc(0) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class Ctap2GetNextAssertionRes implements ICtap2Cmd {
    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}