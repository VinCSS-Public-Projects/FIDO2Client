import { from, Observable, of, partition, Subject } from "rxjs";
import { filter, map, mergeAll } from "rxjs/operators";
import { Device, IFido2Device } from "../../fido2/fido2-device-cli";
import { NfcDeviceNotFound, NfcTransmitDataFailed } from "../../errors/nfc";
import { logger } from "../../log/debug";
import { DeviceService, DeviceState } from "../transport";
import { pcsc, NativeCard, NativeCardMetadata, NativeCardServiceUpdateInterval } from '../../../third_party/pcsc';
import { FragmentReq, FragmentRes, InstructionClass, InstructionCode } from "@components/transports/nfc/fragment";

export type NfcType = 'CCID' | 'UART';

export interface NFC {
    type: NfcType;
    name: string;
    // card: NativeCard;
    atr: Buffer;
    device: IFido2Device;
}

const NfcFido2Aid = Buffer.from('A0000006472F0001', 'hex');
const NfcCtap1Version = Buffer.from('U2F_V2');
const NfcCtap2Version = Buffer.from('FIDO_2_0');

export interface SmartCard {
    send(data: Buffer): Promise<number>;
    recv(): Promise<Buffer>;
}

export class CCID implements SmartCard {

    /**
     * Native card controller.
     */
    private card!: NativeCard;

    /**
     * Response queue.
     */
    private responseQueue: Buffer[];

    constructor(name: string, atr: Buffer) {
        this.responseQueue = [];
        this.card = new NativeCard({ name, atr });
    }

    async send(data: Buffer): Promise<number> {

        logger.debug('send', data.toString('hex'));

        /**
         * Transmit data and get response from card.
         */
        let buff: Buffer;
        try {
            buff = this.card.transmit(data);
        } catch (e) {
            throw new NfcTransmitDataFailed();
        }

        /**
         * Parse response.
         */
        let response = new FragmentRes().deserialize(buff);

        logger.debug('response', response);

        /**
         * Avoid chaining response.
         */
        if (response.data.length > 0) this.responseQueue.push(buff);

        /**
         * Return status.
         */
        return response.status;
    }

    async recv(timeout: number = 30000): Promise<Buffer> {

        /**
         * @TODO fix me, bad waiting counter.
         */
        let count = 0;
        while (count * 100 < timeout) {

            /**
             * Get response from queue.
             */
            let fragment = this.responseQueue.shift();
            count++;

            /**
             * Waiting.
             */
            if (fragment == undefined) { await new Promise((resolve) => { setTimeout(() => { resolve(true) }, 100) }); continue; }

            /**
             * Resolve response.
             */
            return fragment;
        }

        /**
         * Timeout.
         */
        return Buffer.alloc(0);
    }
}

class NfcService implements DeviceService {

    /**
     * Map that store FIDO2 card attach on reader.
     */
    private device: Map<string, { card: NFC, timestamp: number }>;

    /**
     * Subject of FIDO2 card.
     */
    private deviceSubject: Subject<Device>;

    /**
     * Service state.
     */
    state: DeviceState;

    constructor() {

        /**
         * Create map.
         */
        this.device = new Map<string, { card: NFC, timestamp: number }>();

        /**
         * Create subject.
         */
        this.deviceSubject = new Subject<Device>();

        /**
         * Set default service state.
         */
        this.state = DeviceState.off;

        /**
         * Subscribe for new card.
         */
        const [newCard, oldCard] = partition(pcsc.pipe(

            /**
             * Filter invalid card.
             */
            filter(x => !!x.atr && !!x.name),
        ), x => {

            /**
             * Create card id.
             */
            let id = `CCID-${x.name}`;

            /**
             * Is new card.
             */
            return this.device.get(id) === undefined;
        });

        /**
         * Update old card nonce.
         */
        oldCard.subscribe(x => {

            /**
             * Create card id.
             */
            let id = `CCID-${x.name}`;

            /**
             * Update card nonce.
             */
            let card = this.device.get(id);

            /**
             * Double check.
             */
            if (card === undefined) return;

            /**
             * Update card nonce
             */
            card.timestamp = Date.now();
        });

        /**
         * Add new card.
         */
        newCard.pipe(

            /**
             * Filter FIDO2 card.
             */
            filter(x => {
                /**
                 * Create card.
                 */
                let card = new NativeCard(x);

                /**
                 * Send applet selection command.
                 */
                let cmd = new FragmentReq().initialize(InstructionClass.Unknown, InstructionCode.Select, 0x04, 0x00, NfcFido2Aid);

                /**
                 * Serialize and transmit cmd.
                 */
                let buff = card.transmit(cmd.serialize());

                /**
                 * Select card by AID failed.
                 */
                if (buff.length < 2) {
                    return false;
                }

                /**
                 * Parse response.
                 */
                let res = new FragmentRes().deserialize(buff);

                /**
                 * Close card.
                 */
                card.close();

                /**
                 * Determine card capabilities FIDO2.
                 */
                return res.data.compare(NfcCtap1Version) === 0 || res.data.compare(NfcCtap2Version) === 0;
            }),

            /**
             * Map to NFC class.
             */
            map<NativeCardMetadata, NFC>(x => {
                return {
                    type: 'CCID',
                    name: x.name,
                    atr: x.atr,
                    device: {
                        transport: 'nfc',
                        name: x.name,
                        nfcType: 'CCID'
                    }
                }
            }),
        ).subscribe({
            next: card => {

                logger.debug('card attached', card.name, card.atr.toString('hex'));

                /**
                 * Store FIDO2 card.
                 */
                this.device.set(`CCID-${card.name}`, { card, timestamp: Date.now() });

                /**
                 * Notify new FIDO2 card attach.
                 */
                this.deviceSubject.next({ device: card.device, status: 'attach' });
            },
            error: e => {
                logger.debug(e);
            }
        });

        /**
         * Subscribe for update.
         */
        pcsc.update.subscribe(delta => this.device.forEach((x, y) => {

            /**
             * @TODO calculate base on delta, maybe failed when delta is too long.
             */
            if (Date.now() - x.timestamp > NativeCardServiceUpdateInterval) {
                logger.debug('card removed', x.card.name, x.card.atr.toString('hex'));
                this.deviceSubject.next({ device: x.card.device, status: 'detach' });
                this.device.delete(y);
            }
        }));

        logger.debug('create nfc service success');
    }

    /**
     * Turn on nfc service. Find all FIDO2 cards.
     * @returns
     */
    async start(): Promise<void> {

        /**
         * Only start service when service is stopped.
         */
        if (this.state === DeviceState.on) return;

        logger.debug('start nfc service');

        /**
         * Update service state.
         */
        this.state = DeviceState.on;

        /**
         * Start native card service.
         */
        pcsc.start();

        return;
    }

    /**
     * Stop nfc service. Remove all FIDO2 cards.
     * @returns 
     */
    async stop(): Promise<void> {

        /**
         * Only stop service when service is running.
         */
        if (this.state === DeviceState.off) return;

        logger.debug('stop nfc service');

        /**
         * Update service state.
         */
        this.state = DeviceState.off;

        /**
         * Stop native card service.
         */
        pcsc.stop();

        /**
         * Remove all device form store.
         */
        this.device.clear();

        /**
         * Make sure promises are resolved.
         */
        return;
    }

    get observable(): Observable<Device> {
        return this.deviceSubject;
    }

    getCard(name?: string): NFC {
        if (name === undefined) throw new NfcDeviceNotFound();
        let card = this.device.get(name);
        if (card == undefined) throw new NfcDeviceNotFound();
        return card.card;
    }

    async release(): Promise<void> {
        this.state = DeviceState.off;
        // await this.stop();
        // this.ccid.removeAllListeners();
    }

    async shutdown(): Promise<void> {
        return;
    }
}

export const nfc = new NfcService();