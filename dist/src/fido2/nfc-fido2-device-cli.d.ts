/// <reference types="node" />
import { NfcType } from "../transports/nfc/service";
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";
export declare class NfcFido2DeviceCli implements IFido2DeviceCli {
    private device;
    private maxMsgSize;
    constructor(type?: NfcType, name?: string);
    setMaxMsgSize(value: number): void;
    private onError;
    private onSuccess;
    msg(): void;
    cbor(payload: Payload, keepAlive?: (status: number) => void): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): void;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    close(): void;
}
