import { Packet, Payload, Transport } from "../transport";
import noble from '@abandonware/noble';
import { IFido2Device } from "../../fido2/fido2-device-cli";
import { BleDeviceNotCompatibleFido, BleInvalidPacketSequence, BleUnsupportedOnPlatform } from "../../errors/ble";
import { Observable } from "rxjs";
import { BLE, ble, FidoCharacteristic } from "./service";
import { finalize } from "rxjs/operators";
import { logger } from "../../log/debug";

export interface BleCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}

class CtapBleInitFragment implements Packet {
    cmd!: number;
    length!: number;
    data!: Buffer;

    constructor(private maxPacketLength: number) { }

    initialize(cmd: number, length: number, data: Buffer): this {
        this.cmd = cmd;
        this.length = length;
        this.data = data;
        return this;
    }
    serialize(): Buffer {
        let fragment = Buffer.alloc(this.data.length + 3);
        let offset = 0;
        offset = fragment.writeUInt8(this.cmd, offset);
        offset = fragment.writeUInt16BE(this.length, offset);
        offset += this.data.copy(fragment, offset, 0);
        return fragment;
    }
    deserialize(payload: Buffer): this {
        this.cmd = payload[0];
        this.length = payload.readUInt16BE(1);
        this.data = payload.slice(3);
        return this;
    }
}

class CtapBleContinuationFragment implements Packet {
    seq!: number;
    data!: Buffer;

    constructor(private maxPacketLength: number) { }

    initialize(seq: number, data: Buffer): this {
        this.seq = seq & 0x7f;
        this.data = data;
        return this;
    }
    serialize(): Buffer {
        let fragment = Buffer.alloc(this.data.length + 1);
        let offset = 0;
        offset = fragment.writeUInt8(this.seq, offset);
        this.data.copy(fragment, offset, 0);
        return fragment;
    }
    deserialize(payload: Buffer): this {
        this.seq = payload[0];
        this.data = payload.slice(1);
        return this;
    }
}

export class Ble implements Transport {
    private deviceHandle!: BLE;
    private maxFragmentLength!: number;
    private maxInitFragmentLength!: number;
    private maxContinuationFragmentLength!: number;
    private ready: boolean;
    private fidoStatusQueue: Buffer[] = [];

    constructor(uuid: string, maxPacketLength: number) {
        this.deviceHandle = ble.getDevice(uuid);
        this.ready = false;
    }

    static async device(): Promise<Observable<IFido2Device>> {
        await ble.start();
        return ble.observable.pipe(finalize(() => ble.stop()));
    }
    static async release(): Promise<void> {
        return await ble.release(true);
    }
    private async internalSend(data: Buffer): Promise<void> {
        switch (process.platform) {
            case 'win32':
            case 'darwin':
            case 'linux':
                return await this.getCharacteristic(FidoCharacteristic.fidoControlPoint).writeAsync(data, false);
            default:
                throw new BleUnsupportedOnPlatform();
        }
    }
    private async internalRecv(timeout: number): Promise<Buffer> {
        let count = 0;
        while (count * 100 < timeout) {
            let fragment = this.fidoStatusQueue.shift();
            count++;
            if (fragment == undefined) { await new Promise((resolve) => { setTimeout(() => { resolve(true) }, 100) }); continue; }
            return fragment;
        }
        return Buffer.alloc(0);
    }
    private getCharacteristic(characteristic: FidoCharacteristic): noble.Characteristic {
        let c = this.deviceHandle.characteristics.find(x => x.uuid === characteristic);
        if (c === undefined) throw new BleDeviceNotCompatibleFido();
        return c;
    }
    private async init(): Promise<void> {
        /**
         * @TODO write to fidoServiceRevisionBitfield.
         */
        // this.getCharacteristic(FidoCharacteristic.fidoServiceRevisionBitfield).writeAsync(Buffer.alloc(0, 0), false);

        this.maxFragmentLength = this.deviceHandle.device.maxPacketLength || 20;
        this.maxInitFragmentLength = this.maxFragmentLength - 3;
        this.maxContinuationFragmentLength = this.maxFragmentLength - 1;

        await this.getCharacteristic(FidoCharacteristic.fidoStatus).subscribeAsync();
        this.getCharacteristic(FidoCharacteristic.fidoStatus).on('data', (data: Buffer) => {
            this.fidoStatusQueue.push(data);
        });
        this.ready = true;
    }
    async send(payload: Payload): Promise<void> {
        if (!this.ready) await this.init();

        let initFragmentBuffer = Buffer.alloc(payload.data.length <= this.maxInitFragmentLength ? payload.data.length : this.maxInitFragmentLength);
        let offset = 0;

        offset += payload.data.copy(initFragmentBuffer, 0, offset);
        let initFragment = new CtapBleInitFragment(this.maxFragmentLength);
        await this.internalSend(initFragment.initialize(payload.cmd, payload.data.length, initFragmentBuffer).serialize());

        let fragmentSequence = 0;
        while (offset < payload.data.length) {
            let continuationFragmentBuffer = Buffer.alloc((payload.data.length - offset) <= this.maxContinuationFragmentLength ? (payload.data.length - offset) : this.maxContinuationFragmentLength);
            offset += payload.data.copy(continuationFragmentBuffer, 0, offset);
            await this.internalSend(new CtapBleContinuationFragment(this.maxFragmentLength).initialize(fragmentSequence, continuationFragmentBuffer).serialize());
            fragmentSequence++;
        }
    }
    async recv(): Promise<Payload> {
        if (!this.ready) await this.init();
        let initFragment = new CtapBleInitFragment(this.maxFragmentLength);
        let continuationFragment = new CtapBleContinuationFragment(this.maxFragmentLength);

        initFragment.deserialize(await this.internalRecv(30000));

        let result = Buffer.alloc(initFragment.length);
        let fragmentSequence = 0;
        let offset = 0;

        offset += initFragment.data.copy(result, offset, 0);

        while (offset < initFragment.length) {
            continuationFragment.deserialize(await this.internalRecv(30000));
            if (continuationFragment.seq !== fragmentSequence) throw new BleInvalidPacketSequence();
            offset += continuationFragment.data.copy(result, offset);
            fragmentSequence++;
        }
        // this.getCharacteristic(FidoCharacteristic.fidoStatus).unsubscribeAsync();
        return { cmd: initFragment.cmd, data: result };
    }
    async close(): Promise<void> {
        return await ble.release();
    }
}