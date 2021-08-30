/// <reference types="node" />
import { Subject } from "rxjs";
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";
export declare class BleFido2DeviceCli implements IFido2DeviceCli {
    private device;
    private maxMsgSize;
    private ongoingTransaction;
    constructor(uuid: string, maxPacketLength: number);
    get haveTransaction(): boolean;
    setMaxMsgSize(value: number): void;
    private onSuccess;
    private onError;
    msg(): void;
    cbor(payload: Payload, keepAlive?: Subject<number>): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): Promise<void>;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    close(): void;
}
