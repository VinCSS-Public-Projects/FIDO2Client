"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nfc = exports.CCID = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const nfc_1 = require("../../errors/nfc");
const debug_1 = require("../../log/debug");
const transport_1 = require("../transport");
const NfcFido2Aid = 'A0000006472F0001';
const NfcCtap1Version = Buffer.from('U2F_V2');
const NfcCtap2Version = Buffer.from('FIDO_2_0');
class CCID {
    constructor(reader) {
        this.responseQueue = [];
        this.reader = reader;
    }
    get name() {
        return this.reader.reader.name;
    }
    async send(data) {
        // TODO: fix le
        debug_1.logger.debug('send', data.toString('hex'));
        let response = await this.reader.transmit(data, 0xffff);
        debug_1.logger.debug('response', response.toString('hex'));
        let status = response.readUInt16BE(response.length - 2);
        // avoid chaining response status
        if (response.length > 2)
            this.responseQueue.push(response);
        return status;
    }
    async recv(timeout = 30000) {
        let count = 0;
        while (count * 100 < timeout) {
            let fragment = this.responseQueue.shift();
            count++;
            if (fragment == undefined) {
                await new Promise((resolve) => { setTimeout(() => { resolve(true); }, 100); });
                continue;
            }
            return fragment;
        }
        return Buffer.alloc(0);
    }
}
exports.CCID = CCID;
class NfcService {
    constructor() {
        this.device = new Map();
        this.deviceSubject = new rxjs_1.Subject();
        this.state = transport_1.DeviceState.off;
        this.ccid = new (require('nfc-pcsc').NFC)();
        this.ccid.on('reader', (reader) => {
            reader.aid = NfcFido2Aid;
            reader.on('card', (card) => {
                if (!card.data)
                    return;
                if (card.data instanceof Buffer === false)
                    return;
                if (card.data.compare(NfcCtap1Version) !== 0 && card.data.compare(NfcCtap2Version) !== 0)
                    return;
                let fido2Card = { type: 'CCID', name: reader.reader.name, reader, device: { transport: 'nfc', name: reader.reader.name, nfcType: 'CCID' } };
                this.device.set(`CCID-${reader.reader.name}`, fido2Card);
                this.deviceSubject.next({ device: fido2Card.device, status: 'attach' });
            });
            reader.on('card.off', (card) => {
                let d = this.device.get(`CCID-${reader.reader.name}`);
                if (d) {
                    this.deviceSubject.next({ device: d.device, status: 'detach' });
                    this.device.delete(`CCID-${reader.reader.name}`);
                }
                debug_1.logger.debug(`${reader.reader.name} remove card`, card.type);
            });
            reader.on('error', (err) => {
                debug_1.logger.debug(`${reader.reader.name} an error occurred`, err);
            });
            reader.on('end', () => {
                debug_1.logger.debug(`${reader.reader.name} device removed`);
                reader.removeAllListeners();
            });
        });
        this.ccid.on('error', (e) => {
            debug_1.logger.debug('an error occurred', e);
        });
        debug_1.logger.debug('create nfc service success');
    }
    /**
     * Turn on nfc service. Find all fido2 card.
     * @returns
     */
    async start() {
        if (this.state === transport_1.DeviceState.on)
            return;
        debug_1.logger.debug('start nfc service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.on;
        return;
    }
    async stop() {
        if (this.state === transport_1.DeviceState.off)
            return;
        debug_1.logger.debug('stop nfc service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.off;
        return;
    }
    get observable() {
        return rxjs_1.of(rxjs_1.from(this.device.values()).pipe(operators_1.map(x => { return { device: x.device, status: 'attach' }; })), this.deviceSubject).pipe(operators_1.mergeAll());
    }
    getCard(name) {
        if (name === undefined)
            throw new nfc_1.NfcDeviceNotFound();
        let card = this.device.get(name);
        if (card == undefined)
            throw new nfc_1.NfcDeviceNotFound();
        return card;
    }
    async release() {
        this.state = transport_1.DeviceState.off;
        // await this.stop();
        // this.ccid.removeAllListeners();
    }
    async shutdown() {
        this.ccid.removeAllListeners();
        this.device.forEach(x => x.reader.removeAllListeners());
        return;
    }
}
exports.nfc = new NfcService();
