"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ble = exports.FidoCharacteristic = exports.FidoService = void 0;
const rxjs_1 = require("rxjs");
const noble_1 = __importDefault(require("@abandonware/noble"));
const debug_1 = require("../../log/debug");
const transport_1 = require("../transport");
const operators_1 = require("rxjs/operators");
const ble_1 = require("../../errors/ble");
const nodeBle = process.platform === 'win32' ? require('noble-winrt') : noble_1.default;
exports.FidoService = 'fffd';
var FidoCharacteristic;
(function (FidoCharacteristic) {
    FidoCharacteristic["fidoControlPoint"] = "f1d0fff1deaaeceeb42fc9ba7ed623bb";
    FidoCharacteristic["fidoStatus"] = "f1d0fff2deaaeceeb42fc9ba7ed623bb";
    FidoCharacteristic["fidoControlPointLength"] = "f1d0fff3deaaeceeb42fc9ba7ed623bb";
    FidoCharacteristic["fidoServiceRevisionBitfield"] = "f1d0fff4deaaeceeb42fc9ba7ed623bb";
    FidoCharacteristic["fidoServiceRevision"] = "2a28";
    FidoCharacteristic["batteryLevel"] = "2a19";
    FidoCharacteristic["appearance"] = "2a01";
    FidoCharacteristic["deviceName"] = "2a00";
    FidoCharacteristic["firmwareVersion"] = "2a26";
    FidoCharacteristic["manufacturer"] = "2a29";
})(FidoCharacteristic = exports.FidoCharacteristic || (exports.FidoCharacteristic = {}));
var FidoServiceRevisionBit;
(function (FidoServiceRevisionBit) {
    FidoServiceRevisionBit[FidoServiceRevisionBit["U2F_1_1"] = 128] = "U2F_1_1";
    FidoServiceRevisionBit[FidoServiceRevisionBit["U2F_1_2"] = 64] = "U2F_1_2";
    FidoServiceRevisionBit[FidoServiceRevisionBit["FIDO2"] = 32] = "FIDO2";
})(FidoServiceRevisionBit || (FidoServiceRevisionBit = {}));
class BleService {
    constructor() {
        this.state = transport_1.DeviceState.off;
        this.device = new Map();
        this.deviceSubject = new rxjs_1.Subject();
        this.adapterSubject = new rxjs_1.Subject();
        nodeBle.on('stateChange', async (state) => {
            if (state === 'poweredOn') {
                this.adapterSubject.next();
            }
        });
        nodeBle.on('discover', async (peripheral) => {
            debug_1.logger.debug('discover', { uuid: peripheral.uuid, state: peripheral.state, rssi: peripheral.rssi });
            /**
             * Device connecting.
             */
            if (peripheral.state === 'connected' || peripheral.state === 'connecting')
                return;
            /**
             * Device already connected. Not needed but for sure.
             */
            if (this.device.get(peripheral.uuid))
                return;
            /**
             * Connect and get Services/Characteristics.
             */
            await peripheral.connectAsync();
            let sc = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [
                FidoCharacteristic.fidoControlPoint,
                FidoCharacteristic.fidoStatus,
                FidoCharacteristic.fidoControlPointLength,
                FidoCharacteristic.fidoServiceRevisionBitfield,
                FidoCharacteristic.fidoServiceRevision,
                FidoCharacteristic.manufacturer,
                FidoCharacteristic.firmwareVersion,
                FidoCharacteristic.deviceName,
                FidoCharacteristic.appearance,
                FidoCharacteristic.batteryLevel
            ]);
            let device = { transport: 'ble', uuid: peripheral.uuid };
            let fidoControlPoint = false;
            let fidoStatus = false;
            let fidoControlPointLength = false;
            let fidoServiceRevisionBitfield = 0;
            let fidoServiceRevision = false;
            /**
             * Get info.
             */
            await Promise.all(sc.characteristics.map(async (c) => {
                switch (c.uuid.toLowerCase()) {
                    case FidoCharacteristic.batteryLevel: {
                        let batteryLevel = await c.readAsync();
                        if (batteryLevel.length)
                            device.batteryLevel = batteryLevel.readUInt8(0);
                        return true;
                    }
                    case FidoCharacteristic.appearance: {
                        let appearance = await c.readAsync();
                        if (appearance.length)
                            device.appearance = appearance.readUInt16BE(0);
                        return true;
                    }
                    case FidoCharacteristic.deviceName: {
                        let deviceName = await c.readAsync();
                        if (deviceName.length)
                            device.name = deviceName.toString();
                        return true;
                    }
                    case FidoCharacteristic.firmwareVersion: {
                        let firmwareVersion = await c.readAsync();
                        if (firmwareVersion.length)
                            device.firmwareVersion = firmwareVersion.toString();
                        return true;
                    }
                    case FidoCharacteristic.manufacturer: {
                        let manufacturer = await c.readAsync();
                        if (manufacturer.length)
                            device.manufacturer = manufacturer.toString();
                        return true;
                    }
                    case FidoCharacteristic.fidoServiceRevision: {
                        fidoServiceRevision = true;
                        return true;
                    }
                    case FidoCharacteristic.fidoServiceRevisionBitfield: {
                        let buff = await c.readAsync();
                        debug_1.logger.debug(buff.toString('hex'));
                        if (buff.length >= 1)
                            fidoServiceRevisionBitfield = buff.readUInt8(0);
                        return true;
                    }
                    case FidoCharacteristic.fidoControlPointLength: {
                        let buff = await c.readAsync();
                        fidoControlPointLength = true;
                        if (buff.length >= 2)
                            device.maxPacketLength = buff.readUInt16BE(0);
                        return true;
                    }
                    case FidoCharacteristic.fidoStatus: {
                        fidoStatus = true;
                        return true;
                    }
                    case FidoCharacteristic.fidoControlPoint: {
                        fidoControlPoint = true;
                        return true;
                    }
                    default:
                        return true;
                }
            }));
            /**
             * Check for fido2 compatible.
             */
            if (!(fidoControlPoint && fidoControlPointLength && fidoStatus && (fidoServiceRevisionBitfield & FidoServiceRevisionBit.FIDO2))) {
                peripheral.removeAllListeners();
                await peripheral.disconnectAsync();
                return;
            }
            /**
             * Handle disconnect peripheral.
             */
            peripheral.on('disconnect', () => {
                debug_1.logger.debug('disconnect', peripheral.uuid);
                peripheral.removeAllListeners();
                this.device.delete(peripheral.uuid);
            });
            /**
             * Push fido2 device.
             */
            this.device.set(peripheral.uuid, { peripheral, characteristics: sc.characteristics, device });
            this.deviceSubject.next(device);
        });
        debug_1.logger.debug('create ble service success');
    }
    /**
     * Start ble service, allow service to scan device.
     * @returns
     */
    async start() {
        /**
         * Only start service when service is off.
         */
        if (this.state === transport_1.DeviceState.on)
            return;
        debug_1.logger.debug('start ble service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.on;
        /**
         * Ble adapter poweredOn, just start scanning.
         */
        if (nodeBle.state === 'poweredOn') {
            return await nodeBle.startScanningAsync([exports.FidoService], true);
        }
        /**
         * Waiting for ble adapter poweredOn.
         */
        return await new Promise((resolve, reject) => {
            /**
             * Waiting for ble adapter power on.
             */
            this.adapterSubject.pipe(operators_1.first()).subscribe(async () => {
                await nodeBle.startScanningAsync([exports.FidoService], true);
                resolve();
            });
            /**
             * Set timeout in case ble adapter turn off.
             */
            setTimeout(() => {
                debug_1.logger.debug('ble adapter timeout');
                resolve();
            }, 8000);
        });
    }
    /**
     * Stop ble service, stop service scanning device.
     * @returns
     */
    async stop() {
        /**
         * Only start when service is on.
         */
        if (this.state === transport_1.DeviceState.off)
            return;
        debug_1.logger.debug('stop ble service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.off;
        /**
         * Stop scan ble device and disconnect all connected peripheral.
         */
        await nodeBle.stopScanningAsync();
        // this.device.forEach(x => x.peripheral.disconnectAsync());
        return;
    }
    /**
     * Get ble service observable, notify when fido2 ble device is nearby.
     */
    get observable() {
        return this.deviceSubject;
    }
    /**
     * Get connected device.
     */
    getDevice(uuid) {
        let device = this.device.get(uuid);
        if (device === undefined)
            throw new ble_1.BleDeviceNotFound();
        return device;
    }
    /**
     * Release ble service, disconnect all peripheral.
     */
    async release() {
        this.device.forEach(x => x.peripheral.disconnectAsync());
        return;
    }
    /**
     * Remove all listener, free resource, ...
     */
    async shutdown() {
        this.device.forEach(x => x.peripheral.disconnectAsync());
        await nodeBle.stopScanningAsync();
        nodeBle.removeAllListeners();
        return;
    }
}
exports.ble = new BleService();
