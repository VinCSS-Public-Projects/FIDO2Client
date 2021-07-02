import { IFido2Device } from "../../fido2/fido2-device-cli";
import { MethodNotImplemented } from "../../errors/common";
import { Payload, Transport } from "../transport";
import { logger } from "../../log/debug";
import { Observable } from "rxjs";
import { CCID, nfc, NfcType, SmartCard } from "./service";
import { Fragment, InstructionClass, InstructionCode } from "./fragment";
import { finalize } from "rxjs/operators";

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

    static async device(): Promise<Observable<IFido2Device>> {
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

        while (true) {
            switch (status & 0xff00) {
                case 0x6100: {
                    let grsp = new Fragment().initialize(InstructionClass.Command, InstructionCode.NfcCtapGetResponse, 0, 0, undefined, status & 0xff);
                    status = await this.deviceHandle.send(grsp.serialize());
                    break;
                }
                case 0x9000: {
                    if ((status & 0xff) === 0) return;
                }
                default:
                    logger.error(`nfc status ${status.toString(16)}`);
                    return;
            }
        }
    }
    async recv(): Promise<Payload> {
        let fragment: Buffer[] = [];
        while (true) {
            let data = await this.deviceHandle.recv();
            logger.debug(data.toString('hex'));
            let status = data.readUInt16BE(data.length - 2);
            fragment.push(data.slice(0, data.length - 2));
            switch (status & 0xff00) {
                case 0x6100:
                    continue;
                case 0x9000:
                    // TODO: unhandled cmd
                    return { cmd: 0, data: Buffer.concat(fragment) }
                default:
                    logger.error(`nfc status ${status.toString(16)}`);
                    // TODO: handle other error
                    return { cmd: 0, data: Buffer.concat(fragment) }
            }
        }
    }
    close(): void {
        // NfcSvc.turnOff();
    }
}