/// <reference types="node" />
export declare enum InstructionClass {
    Command = 128,
    Chaining = 144
}
export declare enum InstructionCode {
    Select = 164,
    NfcCtapMsg = 16,
    NfcCtapPing = 1,
    NfcCtapGetResponse = 192,
    NfcCtapControl = 18
}
export declare class Fragment {
    cla: InstructionClass;
    ins: InstructionCode;
    p1: number;
    p2: number;
    lc: number;
    data?: Buffer;
    le: number;
    initialize(cla: InstructionClass, ins: InstructionCode, p1: number, p2: number, data?: Buffer, le?: number): this;
    serialize(): Buffer;
    deserialize(payload: Buffer): this;
}
