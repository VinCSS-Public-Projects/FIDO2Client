"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ble = void 0;
const ble_1 = require("../../errors/ble");
const service_1 = require("./service");
const operators_1 = require("rxjs/operators");
class CtapBleInitFragment {
    constructor(maxPacketLength) {
        this.maxPacketLength = maxPacketLength;
    }
    initialize(cmd, length, data) {
        this.cmd = cmd;
        this.length = length;
        this.data = data;
        return this;
    }
    serialize() {
        let fragment = Buffer.alloc(this.data.length + 3);
        let offset = 0;
        offset = fragment.writeUInt8(this.cmd, offset);
        offset = fragment.writeUInt16BE(this.length, offset);
        offset += this.data.copy(fragment, offset, 0);
        return fragment;
    }
    deserialize(payload) {
        this.cmd = payload[0];
        this.length = payload.readUInt16BE(1);
        this.data = payload.slice(3);
        return this;
    }
}
class CtapBleContinuationFragment {
    constructor(maxPacketLength) {
        this.maxPacketLength = maxPacketLength;
    }
    initialize(seq, data) {
        this.seq = seq & 0x7f;
        this.data = data;
        return this;
    }
    serialize() {
        let fragment = Buffer.alloc(this.data.length + 1);
        let offset = 0;
        offset = fragment.writeUInt8(this.seq, offset);
        this.data.copy(fragment, offset, 0);
        return fragment;
    }
    deserialize(payload) {
        this.seq = payload[0];
        this.data = payload.slice(1);
        return this;
    }
}
class Ble {
    constructor(uuid, maxPacketLength) {
        this.fidoStatusQueue = [];
        this.deviceHandle = service_1.ble.getDevice(uuid);
        this.ready = false;
    }
    static async device() {
        await service_1.ble.start();
        return service_1.ble.observable.pipe(operators_1.finalize(() => service_1.ble.stop()));
    }
    static async release() {
        return await service_1.ble.release();
    }
    async internalSend(data) {
        switch (process.platform) {
            case 'win32':
            case 'darwin':
            case 'linux':
                return await this.getCharacteristic(service_1.FidoCharacteristic.fidoControlPoint).writeAsync(data, false);
            default:
                throw new ble_1.BleUnsupportedOnPlatform();
        }
    }
    async internalRecv(timeout) {
        let count = 0;
        while (count * 100 < timeout) {
            let fragment = this.fidoStatusQueue.shift();
            count++;
            if (fragment == undefined) {
                await new Promise((resolve) => { setTimeout(() => { resolve(true); }, 100); });
                continue;
            }
            return fragment;
        }
        return Buffer.alloc(0);
    }
    getCharacteristic(characteristic) {
        let c = this.deviceHandle.characteristics.find(x => x.uuid === characteristic);
        if (c === undefined)
            throw new ble_1.BleDeviceNotCompatibleFido();
        return c;
    }
    async init() {
        /**
         * @TODO write to fidoServiceRevisionBitfield.
         */
        // this.getCharacteristic(FidoCharacteristic.fidoServiceRevisionBitfield).writeAsync(Buffer.alloc(0, 0), false);
        this.maxFragmentLength = this.deviceHandle.device.maxPacketLength || 20;
        this.maxInitFragmentLength = this.maxFragmentLength - 3;
        this.maxContinuationFragmentLength = this.maxFragmentLength - 1;
        await this.getCharacteristic(service_1.FidoCharacteristic.fidoStatus).subscribeAsync();
        this.getCharacteristic(service_1.FidoCharacteristic.fidoStatus).on('data', (data) => {
            this.fidoStatusQueue.push(data);
        });
        this.ready = true;
    }
    async send(payload) {
        if (!this.ready)
            await this.init();
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
    async recv() {
        if (!this.ready)
            await this.init();
        let initFragment = new CtapBleInitFragment(this.maxFragmentLength);
        let continuationFragment = new CtapBleContinuationFragment(this.maxFragmentLength);
        initFragment.deserialize(await this.internalRecv(30000));
        let result = Buffer.alloc(initFragment.length);
        let fragmentSequence = 0;
        let offset = 0;
        offset += initFragment.data.copy(result, offset, 0);
        while (offset < initFragment.length) {
            continuationFragment.deserialize(await this.internalRecv(30000));
            if (continuationFragment.seq !== fragmentSequence)
                throw new ble_1.BleInvalidPacketSequence();
            offset += continuationFragment.data.copy(result, offset);
            fragmentSequence++;
        }
        // this.getCharacteristic(FidoCharacteristic.fidoStatus).unsubscribeAsync();
        return { cmd: initFragment.cmd, data: result };
    }
    async close() {
        // return await ble.release();
    }
}
exports.Ble = Ble;
//# sourceMappingURL=ble.js.map