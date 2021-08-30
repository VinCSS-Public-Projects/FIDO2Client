/// <reference types="node" />
import { NfcType } from "../transports/nfc/service";
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";
import { Subject } from "rxjs/internal/Subject";
export declare class NfcFido2DeviceCli implements IFido2DeviceCli {
    private device;
    private maxMsgSize;
    private ongoingTransaction;
    constructor(type?: NfcType, name?: string);
    get haveTransaction(): boolean;
    setMaxMsgSize(value: number): void;
    private onError;
    private onSuccess;
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
