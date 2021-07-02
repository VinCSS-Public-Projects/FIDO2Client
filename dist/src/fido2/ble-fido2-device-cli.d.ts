/// <reference types="node" />
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";
export declare class BleFido2DeviceCli implements IFido2DeviceCli {
    private device;
    private maxMsgSize;
    private ongoingTransaction;
    constructor(uuid: string, maxPacketLength: number);
    setMaxMsgSize(value: number): void;
    private onSuccess;
    private onError;
    msg(): void;
    cbor(payload: Payload, keepAlive?: (status: number) => void): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): Promise<void>;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    close(): void;
}
