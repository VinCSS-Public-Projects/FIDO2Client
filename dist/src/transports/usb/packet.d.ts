/// <reference types="node" />
export declare const CtapHidChannelBusy: Buffer;
export declare const CtapHidBroadcastCid: Buffer;
export declare class CtapHidInitPacket {
    private maxPacketLength;
    cid: Buffer;
    cmd: number;
    length: number;
    data: Buffer;
    constructor(maxPacketLength: number);
    initialize(cid: Buffer, cmd: number, length: number, data: Buffer): this;
    serialize(): Buffer;
    deserialize(payload: Buffer): this;
}
export declare class CtapHidContinuationPacket {
    private maxPacketLength;
    cid: Buffer;
    sequence: number;
    data: Buffer;
    constructor(maxPacketLength: number);
    initialize(cid: Buffer, sequence: number, data: Buffer): this;
    serialize(): Buffer;
    deserialize(payload: Buffer): void;
}
