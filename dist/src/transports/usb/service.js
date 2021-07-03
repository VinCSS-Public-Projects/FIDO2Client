"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usb = void 0;
const rxjs_1 = require("rxjs");
const node_hid_1 = require("node-hid");
const operators_1 = require("rxjs/operators");
const debug_1 = require("../../log/debug");
const bindings_1 = require("./native/bindings");
const transport_1 = require("../transport");
const kHidUsage = 1;
const kHidUsagePage = 0xf1d0;
class UsbService {
    constructor() {
        this.state = transport_1.DeviceState.off;
        this.device = new Map();
        this.deviceSubject = new rxjs_1.Subject();
        this.adapterSubject = new rxjs_1.Subject();
        debug_1.logger.debug('create usb service success');
    }
    async start() {
        /**
         * Only start usb service when service is off.
         */
        if (this.state === transport_1.DeviceState.on)
            return;
        debug_1.logger.debug('start usb service');
        /**
         * @TODO fix me. Implement usb detection instead scan device by interval.
         */
        rxjs_1.interval(1600).pipe(operators_1.takeUntil(this.adapterSubject)).subscribe(() => rxjs_1.from(node_hid_1.devices()).pipe(operators_1.filter(x => x.usage === kHidUsage && x.usagePage === kHidUsagePage), operators_1.filter(x => x.path !== undefined), operators_1.filter(x => this.device.get(x.path) === undefined), operators_1.map(x => {
            let info = bindings_1.deviceInfo(x.path);
            return {
                path: x.path,
                serialNumber: info.serial,
                manufacturer: info.manufacturer,
                product: info.product,
                transport: 'usb'
            };
        })).subscribe(x => {
            this.device.set(x.path, x);
            this.deviceSubject.next(x);
        }));
        this.state = transport_1.DeviceState.on;
        return;
    }
    async stop() {
        /**
         * Only stop usb service when service is on.
         */
        if (this.state === transport_1.DeviceState.off)
            return;
        debug_1.logger.debug('stop usb service');
        /**
         * Update service state.
         */
        this.state = transport_1.DeviceState.off;
        this.adapterSubject.next();
        this.device.clear();
    }
    get observable() {
        return this.deviceSubject;
    }
    async release() {
        this.adapterSubject.next();
        this.device.clear();
        return;
    }
    async shutdown() {
        this.adapterSubject.next();
        this.device.clear();
        return;
    }
}
exports.usb = new UsbService();
