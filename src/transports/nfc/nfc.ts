import { Device, IFido2Device } from "../../fido2/fido2-device-cli";
import { MethodNotImplemented } from "../../errors/common";
import { Payload, Transport } from "../transport";
import { logger } from "../../log/debug";
import { Observable } from "rxjs";
import { CCID, nfc, NfcType, SmartCard } from "./service";
import { Fragment, InstructionClass, InstructionCode } from "./fragment";
import { finalize } from "rxjs/operators";
import { CtapNfcCborCmd } from "./cmd/cbor";
import { CtapNfcKeepAliveCmd } from "./cmd/keep-alive";
import { NfcInvalidStatusCode } from "../../errors/nfc";

export interface NfcCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}

export class Nfc implements Transport {
    private deviceHandle!: SmartCard;
    /**
     * @TODO find a way to determine fragment size. Currently using the minimum value.
     */
    private maxFragmentLength: number = 0x80;

    constructor(type?: NfcType, name?: string) {
        switch (type) {
            case 'CCID':
                this.deviceHandle = new CCID(nfc.getCard(`${type}-${name}`).reader);
                break;
            default:
                throw new MethodNotImplemented();
        }
    }

    static async device(): Promise<Observable<Device>> {
        await nfc.start();
        return nfc.observable.pipe(finalize(() => nfc.stop()));
    }
    static async release(): Promise<void> {
        await nfc.release();
        return;
    }
    async send(payload: Payload): Promise<void> {
        let status: number = 0;
        if (payload.data.length <= this.maxFragmentLength) {
            let fragment = new Fragment().initialize(InstructionClass.Command, InstructionCode.NfcCtapMsg, 0x80, 0, payload.data);
            status = await this.deviceHandle.send(fragment.serialize());
        } else {
            let offset = 0;
            while (offset < payload.data.length) {
                let chain = payload.data.slice(offset, offset + this.maxFragmentLength);
                offset += chain.length;
                let cls = offset >= payload.data.length ? InstructionClass.Command : InstructionClass.Chaining;
                let fragment = new Fragment().initialize(cls, InstructionCode.NfcCtapMsg, 0x80, 0, chain);
                status = await this.deviceHandle.send(fragment.serialize());
            }
        }
    }
    async recv(): Promise<Payload> {
        let fragments: Buffer[] = [];

        while (true) {
            let data = await this.deviceHandle.recv();
            let status = data.readUInt16BE(data.length - 2);
            let buff = data.slice(0, data.length - 2);
            switch (status & 0xff00) {
                case 0x9000: {
                    fragments.push(buff);
                    return { cmd: CtapNfcCborCmd, data: Buffer.concat(fragments) }
                }
                case 0x6100:
                    let grsp = new Fragment().initialize(InstructionClass.Command, InstructionCode.NfcCtapUnknown, 0, 0, undefined, status & 0xff);
                    await this.deviceHandle.send(grsp.serialize());
                    fragments.push(buff);
                    continue;
                case 0x9100: {
                    let gRsp = new Fragment().initialize(InstructionClass.Command, InstructionCode.NfcCtapGetResponse, 0, 0, undefined);
                    await this.deviceHandle.send(gRsp.serialize());
                    return { cmd: CtapNfcKeepAliveCmd, data: buff }
                }
                default:
                    logger.debug(`nfc status ${status.toString(16)}`);
                    // TODO: handle other error
                    throw new NfcInvalidStatusCode();
            }
        }
    }
    close(): void {
        // NfcSvc.turnOff();
    }
}