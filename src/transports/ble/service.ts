import { Observable, Subject } from "rxjs";
import { IFido2Device } from "../../fido2/fido2-device-cli";
import noble from '@abandonware/noble';
import { logger } from "../../log/debug";
import { DeviceService, DeviceState } from "../transport";
import { first } from "rxjs/operators";
import { BleDeviceNotFound } from "../../errors/ble";
const nodeBle = process.platform === 'win32' ? require('noble-winrt') as typeof noble : noble;

export interface BLE {
    peripheral: noble.Peripheral;
    characteristics: noble.Characteristic[];
    device: IFido2Device
}

export const FidoService = 'fffd';
export enum FidoCharacteristic {
    fidoControlPoint = 'f1d0fff1deaaeceeb42fc9ba7ed623bb',
    fidoStatus = 'f1d0fff2deaaeceeb42fc9ba7ed623bb',
    fidoControlPointLength = 'f1d0fff3deaaeceeb42fc9ba7ed623bb',
    fidoServiceRevisionBitfield = 'f1d0fff4deaaeceeb42fc9ba7ed623bb',
    fidoServiceRevision = '2a28',
    batteryLevel = '2a19',
    appearance = '2a01',
    deviceName = '2a00',
    firmwareVersion = '2a26',
    manufacturer = '2a29'
}

enum FidoServiceRevisionBit {
    U2F_1_1 = 0x80,
    U2F_1_2 = 0x40,
    FIDO2 = 0x20,
}

class BleService implements DeviceService {
    state: DeviceState;
    private device: Map<string, BLE>;
    private deviceSubject: Subject<IFido2Device>;
    private adapterSubject: Subject<void>;

    constructor() {
        this.state = DeviceState.off;
        this.device = new Map<string, BLE>();
        this.deviceSubject = new Subject<IFido2Device>();
        this.adapterSubject = new Subject<void>();

        nodeBle.on('stateChange', async (state) => {
            if (state === 'poweredOn') {
                this.adapterSubject.next();
            }
        });
        nodeBle.on('discover', async (peripheral) => {
            logger.debug('discover', { uuid: peripheral.uuid, state: peripheral.state, rssi: peripheral.rssi });

            /**
             * Device connecting.
             */
            if (peripheral.state === 'connected' || peripheral.state === 'connecting') return;

            /**
             * Device already connected. Not needed but for sure.
             */
            if (this.device.get(peripheral.uuid)) return;

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

            let device: IFido2Device = { transport: 'ble', uuid: peripheral.uuid };
            let fidoControlPoint: boolean = false;
            let fidoStatus: boolean = false;
            let fidoControlPointLength: boolean = false;
            let fidoServiceRevisionBitfield: number = 0;
            let fidoServiceRevision: boolean = false;

            /**
             * Get info.
             */
            await Promise.all(sc.characteristics.map<Promise<boolean>>(async c => {
                switch (c.uuid.toLowerCase()) {
                    case FidoCharacteristic.batteryLevel: {
                        let batteryLevel = await c.readAsync();
                        if (batteryLevel.length) device.batteryLevel = batteryLevel.readUInt8(0);
                        return true;
                    }
                    case FidoCharacteristic.appearance: {
                        let appearance = await c.readAsync();
                        if (appearance.length) device.appearance = appearance.readUInt16BE(0);
                        return true;
                    }
                    case FidoCharacteristic.deviceName: {
                        let deviceName = await c.readAsync();
                        if (deviceName.length) device.name = deviceName.toString();
                        return true;
                    }
                    case FidoCharacteristic.firmwareVersion: {
                        let firmwareVersion = await c.readAsync();
                        if (firmwareVersion.length) device.firmwareVersion = firmwareVersion.toString();
                        return true;
                    }
                    case FidoCharacteristic.manufacturer: {
                        let manufacturer = await c.readAsync();
                        if (manufacturer.length) device.manufacturer = manufacturer.toString();
                        return true;
                    }
                    case FidoCharacteristic.fidoServiceRevision: {
                        fidoServiceRevision = true;
                        return true;
                    }
                    case FidoCharacteristic.fidoServiceRevisionBitfield: {
                        let buff = await c.readAsync();
                        logger.debug(buff.toString('hex'));
                        if (buff.length >= 1) fidoServiceRevisionBitfield = buff.readUInt8(0);
                        return true;
                    }
                    case FidoCharacteristic.fidoControlPointLength: {
                        let buff = await c.readAsync();
                        fidoControlPointLength = true;
                        if (buff.length >= 2) device.maxPacketLength = buff.readUInt16BE(0);
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
             * GAP device name not available.
             */
            device.name || (device.name = peripheral.advertisement.localName);

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
                logger.debug('disconnect', peripheral.uuid);
                peripheral.removeAllListeners();
                this.device.delete(peripheral.uuid);
            });

            /**
             * Push fido2 device.
             */
            this.device.set(peripheral.uuid, { peripheral, characteristics: sc.characteristics, device });
            this.deviceSubject.next(device);
        });

        logger.debug('create ble service success');
    }

    /**
     * Start ble service, allow service to scan device.
     * @returns 
     */
    async start(): Promise<void> {
        /**
         * Only start service when service is off.
         */
        if (this.state === DeviceState.on) return;

        logger.debug('start ble service');

        /**
         * Update service state.
         */
        this.state = DeviceState.on;

        /**
         * Ble adapter poweredOn, just start scanning.
         */
        if (nodeBle.state === 'poweredOn') {
            return await nodeBle.startScanningAsync([FidoService], true);
        }

        /**
         * Waiting for ble adapter poweredOn.
         */
        return await new Promise<void>((resolve, reject) => {

            /**
             * Set timeout in case ble adapter turn off.
             */
            const timer = setTimeout(() => {
                logger.debug('ble adapter timeout')
                resolve();
            }, 8000);

            /**
             * Waiting for ble adapter power on.
             */
            this.adapterSubject.pipe(first()).subscribe(async () => {
                clearTimeout(timer);
                await nodeBle.startScanningAsync([FidoService], true);
                resolve();
            });
        });
    }

    /**
     * Stop ble service, stop service scanning device.
     * @returns
     */
    async stop(): Promise<void> {
        /**
         * Only start when service is on.
         */
        if (this.state === DeviceState.off) return;

        logger.debug('stop ble service');

        /**
         * Update service state.
         */
        this.state = DeviceState.off;

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
    get observable(): Observable<IFido2Device> {
        return this.deviceSubject;
    }

    /**
     * Get connected device.
     */
    getDevice(uuid: string): BLE {
        let device = this.device.get(uuid);
        if (device === undefined) throw new BleDeviceNotFound();
        return device;
    }

    /**
     * Release ble service, disconnect all peripheral.
     */
    async release(): Promise<void> {
        this.device.forEach(x => x.peripheral.disconnectAsync());
        return;
    }

    /**
     * Remove all listener, free resource, ...
     */
    async shutdown(): Promise<void> {
        this.device.forEach(x => x.peripheral.disconnectAsync());
        await nodeBle.stopScanningAsync();
        nodeBle.removeAllListeners();
        return;
    }
}

export const ble = new BleService();