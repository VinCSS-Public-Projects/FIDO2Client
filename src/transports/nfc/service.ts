import { from, Observable, of, Subject } from "rxjs";
import { map, mergeAll } from "rxjs/operators";
import { Device, IFido2Device } from "../../fido2/fido2-device-cli";
import { NfcDeviceNotFound } from "../../errors/nfc";
import { logger } from "../../log/debug";
import { DeviceService, DeviceState } from "../transport";

export type NfcType = 'CCID' | 'UART';

export interface NFC {
    type: NfcType;
    name: string;
    reader: any;
    device: IFido2Device;
}

const NfcFido2Aid = 'A0000006472F0001';
const NfcCtap1Version = Buffer.from('U2F_V2');
const NfcCtap2Version = Buffer.from('FIDO_2_0');

export interface SmartCard {
    send(data: Buffer): Promise<number>;
    recv(): Promise<Buffer>;
}

export class CCID implements SmartCard {
    private reader!: any;
    private responseQueue: Buffer[];

    constructor(reader: any) {
        this.responseQueue = [];
        this.reader = reader;
    }

    get name(): string {
        return this.reader.reader.name;
    }

    async send(data: Buffer): Promise<number> {
        // TODO: fix le
        logger.debug('send', data.toString('hex'));
        let response: Buffer = await this.reader.transmit(data, 0xffff);
        logger.debug('response', response.toString('hex'));
        let status = response.readUInt16BE(response.length - 2);

        // avoid chaining response status
        if (response.length > 2) this.responseQueue.push(response);
        return status;
    }
    async recv(timeout: number = 30000): Promise<Buffer> {
        let count = 0;
        while (count * 100 < timeout) {
            let fragment = this.responseQueue.shift();
            count++;
            if (fragment == undefined) { await new Promise((resolve) => { setTimeout(() => { resolve(true) }, 100) }); continue; }
            return fragment;
        }
        return Buffer.alloc(0);
    }
}

class NfcService implements DeviceService {
    private device: Map<string, NFC>;
    private deviceSubject: Subject<Device>;
    private ccid: any;
    state: DeviceState;

    constructor() {
        this.device = new Map<string, NFC>();
        this.deviceSubject = new Subject<Device>();
        this.state = DeviceState.off;
        this.ccid = new (require('nfc-pcsc').NFC)();
        this.ccid.on('reader', (reader: any) => {
            reader.aid = NfcFido2Aid;
            reader.on('card', (card: any) => {
                if (!card.data) return;
                if (card.data instanceof Buffer === false) return;
                if (card.data.compare(NfcCtap1Version) !== 0 && card.data.compare(NfcCtap2Version) !== 0) return;
                let fido2Card: NFC = { type: 'CCID', name: reader.reader.name, reader, device: { transport: 'nfc', name: reader.reader.name, nfcType: 'CCID' } };
                this.device.set(`CCID-${reader.reader.name}`, fido2Card);
                this.deviceSubject.next({ device: fido2Card.device, status: 'attach' });
            });
            reader.on('card.off', (card: any) => {
                let d = this.device.get(`CCID-${reader.reader.name}`);
                if (d) {
                    this.deviceSubject.next({ device: d.device, status: 'detach' });
                    this.device.delete(`CCID-${reader.reader.name}`);
                }
                logger.debug(`${reader.reader.name} remove card`, card.type);
            });
            reader.on('error', (err: any) => {
                logger.debug(`${reader.reader.name} an error occurred`, err);
            });
            reader.on('end', () => {
                logger.debug(`${reader.reader.name} device removed`);
                reader.removeAllListeners();
            });
        });
        this.ccid.on('error', (e: any) => {
            logger.debug('an error occurred', e);
        });

        logger.debug('create nfc service success');
    }

    /**
     * Turn on nfc service. Find all fido2 card.
     * @returns
     */
    async start(): Promise<void> {
        if (this.state === DeviceState.on) return;

        logger.debug('start nfc service');

        /**
         * Update service state.
         */
        this.state = DeviceState.on;

        return;
    }

    async stop(): Promise<void> {
        if (this.state === DeviceState.off) return;

        logger.debug('stop nfc service');

        /**
         * Update service state.
         */
        this.state = DeviceState.off;

        return;
    }

    get observable(): Observable<Device> {
        return of(from(this.device.values()).pipe(map<NFC, Device>(x => { return { device: x.device, status: 'attach' } })), this.deviceSubject).pipe(mergeAll());
    }

    getCard(name?: string): NFC {
        if (name === undefined) throw new NfcDeviceNotFound();
        let card = this.device.get(name);
        if (card == undefined) throw new NfcDeviceNotFound();
        return card;
    }

    async release(): Promise<void> {
        this.state = DeviceState.off;
        // await this.stop();
        // this.ccid.removeAllListeners();
    }

    async shutdown(): Promise<void> {
        this.ccid.removeAllListeners();
        this.device.forEach(x => x.reader.removeAllListeners());
        return;
    }
}

export const nfc = new NfcService();