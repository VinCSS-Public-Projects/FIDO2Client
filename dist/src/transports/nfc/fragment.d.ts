/// <reference types="node" />
/**
 * @TODO rename instruction class.
 */
export declare enum InstructionClass {
    Unknown = 0,
    Command = 128,
    Chaining = 144
}
/**
 * @TODO rename instruction code.
 */
export declare enum InstructionCode {
    Select = 164,
    NfcCtapMsg = 16,
    NfcCtapPing = 1,
    NfcCtapGetResponse = 17,
    NfcCtapUnknown = 192,
    NfcCtapControl = 18
}
export declare class FragmentReq {
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
export declare class FragmentRes {
    /**
     * Buffer contains the data from the card.
     */
    data: Buffer;
    /**
     * Status code from card.
     */
    status: number;
    deserialize(payload: Buffer): this;
}
