/// <reference types="node" />
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";
export declare class HidFido2DeviceCli implements IFido2DeviceCli {
    private device;
    private maxMsgSize;
    private ongoingTransaction;
    constructor(path: string, maxPacketLength: number);
    setMaxMsgSize(value: number): void;
    msg(): void;
    cbor(payload: Payload, keepAlive?: (status: number) => void): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): Promise<void>;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    private onCbor;
    private onError;
    close(): void;
}
