"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nfc = exports.CCID = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const nfc_1 = require("../../errors/nfc");
const debug_1 = require("../../log/debug");
const transport_1 = require("../transport");
const pcsc_1 = require("../../../third_party/pcsc");
const fragment_1 = require("@components/transports/nfc/fragment");
const NfcFido2Aid = Buffer.from('A0000006472F0001', 'hex');
const NfcCtap1Version = Buffer.from('U2F_V2');
const NfcCtap2Version = Buffer.from('FIDO_2_0');
class CCID {
    constructor(name, atr) {
        this.responseQueue = [];
        this.card = new pcsc_1.NativeCard({ name, atr });
    }
    async send(data) {
        debug_1.logger.debug('send', data.toString('hex'));
        /**
         * Transmit data and get response from card.
         */
        let buff = this.card.transmit(data);
        /**
         * Parse response.
         */
        let response = new fragment_1.FragmentRes().deserialize(buff);
        debug_1.logger.debug('response', response);
        /**
         * Avoid chaining response.
         */
        if (response.data.length > 0)
            this.responseQueue.push(buff);
        /**
         * Return status.
         */
        return response.status;
    }
    async recv(timeout = 30000) {
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
            if (fragment == undefined) {
                await new Promise((resolve) => { setTimeout(() => { resolve(true); }, 100); });
                continue;
            }
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
exports.CCID = CCID;
class NfcService {
    constructor() {
        /**
         * Create map.
         */
        this.device = new Map();
        /**
         * Create subject.
         */
        this.deviceSubject = new rxjs_1.Subject();
        /**
         * Set default service state.
         */
        this.state = transport_1.DeviceState.off;
        /**
         * Subscribe for new card.
         */
        const [newCard, oldCard] = rxjs_1.partition(pcsc_1.pcsc.pipe(
        /**
         * Filter invalid card.
         */
        operators_1.filter(x => !!x.atr && !!x.name)), x => {
            /**
             * Create card id.
             */
            let id = `CCID-${x.name}}`;
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
            if (card === undefined)
                return;
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
        operators_1.filter(x => {
            /**
             * Create card.
             */
            let card = new pcsc_1.NativeCard(x);
            /**
             * Send applet selection command.
             */
            let cmd = new fragment_1.FragmentReq().initialize(fragment_1.InstructionClass.Unknown, fragment_1.InstructionCode.Select, 0x04, 0x00, NfcFido2Aid);
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
            let res = new fragment_1.FragmentRes().deserialize(buff);
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
        operators_1.map(x => {
            return {
                type: 'CCID',
                name: x.name,
                atr: x.atr,
                device: {
                    transport: 'nfc',
                    name: x.name,
                    nfcType: 'CCID'
                }
            };
        })).subscribe(card => {
            /**
             * Store FIDO2 card.
             */
            this.device.set(`CCID-${card.name}`, { card, timestamp: Date.now() });
            /**
             * Notify new FIDO2 card attach.
             */
            this.deviceSubject.next({ device: card.device, status: 'attach' });
        });
        /**
         * Subscribe for update.
         */
        pcsc_1.pcsc.update.subscribe(delta => this.device.forEach((x, y) => {
            /**
             * @TODO calculate base on delta, maybe failed when delta is too long.
             */
            if (Date.now() - x.timestamp > pcsc_1.NativeCardServiceUpdateInterval) {
                this.device.delete(y);
            }
        }));
        debug_1.logger.debug('create nfc service success');
    }
    /**
     * Turn on nfc service. Find all FIDO2 cards.
     * @returns
     */
    async start() {
        /**
         * Only start service when service is stopped.
         */
        if (this.state === transport_1.DeviceState.on)
            return;
        debug_1.logger.debug('start nfc service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.on;
        /**
         * Start native card service.
         */
        pcsc_1.pcsc.start();
        return;
    }
    /**
     * Stop nfc service. Remove all FIDO2 cards.
     * @returns
     */
    async stop() {
        /**
         * Only stop service when service is running.
         */
        if (this.state === transport_1.DeviceState.off)
            return;
        debug_1.logger.debug('stop nfc service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.off;
        /**
         * Stop native card service.
         */
        pcsc_1.pcsc.stop();
        /**
         * Remove all device form store.
         */
        this.device.clear();
        /**
         * Make sure promises are resolved.
         */
        return;
    }
    get observable() {
        return this.deviceSubject;
    }
    getCard(name) {
        if (name === undefined)
            throw new nfc_1.NfcDeviceNotFound();
        let card = this.device.get(name);
        if (card == undefined)
            throw new nfc_1.NfcDeviceNotFound();
        return card.card;
    }
    async release() {
        this.state = transport_1.DeviceState.off;
        // await this.stop();
        // this.ccid.removeAllListeners();
    }
    async shutdown() {
        return;
    }
}
exports.nfc = new NfcService();
//# sourceMappingURL=service.js.map