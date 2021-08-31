"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usb = exports.CtapHidCapBit = exports.CtapHidCmd = void 0;
const crypto_1 = require("../../crypto/crypto");
const usb_1 = require("../../errors/usb");
const init_1 = require("./cmd/init");
const node_hid_1 = require("node-hid");
const debug_1 = require("../../log/debug");
const error_1 = require("./cmd/error");
const service_1 = require("./service");
const packet_1 = require("./packet");
const operators_1 = require("rxjs/operators");
var CtapHidCmd;
(function (CtapHidCmd) {
    CtapHidCmd[CtapHidCmd["Msg"] = 3] = "Msg";
    CtapHidCmd[CtapHidCmd["Cbor"] = 16] = "Cbor";
    CtapHidCmd[CtapHidCmd["Init"] = 6] = "Init";
    CtapHidCmd[CtapHidCmd["Ping"] = 1] = "Ping";
    CtapHidCmd[CtapHidCmd["Cancel"] = 17] = "Cancel";
    CtapHidCmd[CtapHidCmd["Error"] = 63] = "Error";
    CtapHidCmd[CtapHidCmd["KeepAlive"] = 59] = "KeepAlive";
    CtapHidCmd[CtapHidCmd["Wink"] = 8] = "Wink";
    CtapHidCmd[CtapHidCmd["Lock"] = 4] = "Lock";
})(CtapHidCmd = exports.CtapHidCmd || (exports.CtapHidCmd = {}));
var CtapHidCapBit;
(function (CtapHidCapBit) {
    CtapHidCapBit[CtapHidCapBit["Wink"] = 1] = "Wink";
    CtapHidCapBit[CtapHidCapBit["Cbor"] = 4] = "Cbor";
    CtapHidCapBit[CtapHidCapBit["Nmsg"] = 8] = "Nmsg";
})(CtapHidCapBit = exports.CtapHidCapBit || (exports.CtapHidCapBit = {}));
class Usb {
    constructor(devciePath, maxPacketLength) {
        this.cid = packet_1.CtapHidBroadcastCid;
        this.deviceHandle = new node_hid_1.HID(devciePath);
        this.deviceHandle.on('error', (e) => {
            debug_1.logger.debug(e);
        });
        this.maxPacketLength = maxPacketLength;
        this.initPacketLength = this.maxPacketLength - 7;
        this.continuationPacketLength = this.maxPacketLength - 5;
        this.status = 'unavailable';
    }
    static async device() {
        await service_1.usb.start();
        return service_1.usb.observable.pipe((0, operators_1.finalize)(() => service_1.usb.stop()));
    }
    static async release() {
        await service_1.usb.release();
        return;
    }
    internalSend(data) {
        switch (process.platform) {
            case 'win32':
                return this.deviceHandle.write(Buffer.concat([Buffer.alloc(1), data]));
            case 'darwin':
                return this.deviceHandle.write(Buffer.concat([Buffer.alloc(data[0] === 0x00 ? 1 : 0), data]));
            case 'linux':
                return this.deviceHandle.write(data);
            default:
                throw new usb_1.UsbUnsupportedOnPlatform();
        }
    }
    async init() {
        debug_1.logger.debug('init');
        this.status = 'initializing';
        let nonce = crypto_1.Fido2Crypto.random(8);
        await this.send(new init_1.CtapHidInitReq(nonce).serialize());
        let ctap = await this.recv();
        debug_1.logger.debug(ctap.cmd.toString(16), ctap.data.toString('hex'));
        if (ctap.cmd === CtapHidCmd.Error && ctap.data.compare(packet_1.CtapHidChannelBusy) === 0) {
            throw new usb_1.UsbDeviceBusy();
        }
        if (ctap.cmd !== CtapHidCmd.Init) {
            throw new usb_1.UsbCmdMismatch();
        }
        let init = new init_1.CtapHidInitRes().deserialize(ctap.data);
        if (init.nonce.compare(nonce) !== 0)
            throw new usb_1.UsbCmdInitNonceMismatch();
        this.cid = init.cid;
        this.ctapVersion = init.ctapVersion;
        this.deviceBuild = init.deviceBuild;
        this.deviceMinor = init.deviceMinor;
        this.deviceMajor = init.deviceMajor;
        this.deviceCapabilities = init.deviceCapabilities;
        if ((this.deviceCapabilities & CtapHidCapBit.Cbor) === 0)
            throw new usb_1.UsbDeviceNotCompatibleFido();
        this.status = 'initialized';
    }
    async send(payload) {
        if (this.status === 'unavailable')
            await this.init();
        let initPacketBuff = Buffer.alloc(this.initPacketLength);
        let continuationPacketBuff = Buffer.alloc(this.continuationPacketLength);
        let offset = 0;
        offset += payload.data.copy(initPacketBuff, 0, offset);
        let initPacket = new packet_1.CtapHidInitPacket(this.maxPacketLength);
        let buffer = initPacket.initialize(this.cid, payload.cmd, payload.data.length, initPacketBuff).serialize();
        this.internalSend(buffer);
        let packetSequence = 0;
        while (offset < payload.data.length) {
            continuationPacketBuff.fill(0);
            offset += payload.data.copy(continuationPacketBuff, 0, offset);
            this.internalSend(new packet_1.CtapHidContinuationPacket(this.maxPacketLength).initialize(this.cid, packetSequence, continuationPacketBuff).serialize());
            packetSequence++;
        }
    }
    async recv() {
        if (this.status === 'unavailable')
            await this.init();
        let initPacket = new packet_1.CtapHidInitPacket(this.maxPacketLength);
        let continuationPacket = new packet_1.CtapHidContinuationPacket(this.maxPacketLength);
        initPacket.deserialize(Buffer.from(this.deviceHandle.readTimeout(30000)));
        // TODO: fix me. CtapHidErrorCmd may return invalid channel
        if (this.cid.compare(initPacket.cid) !== 0 && initPacket.cmd !== error_1.CtapHidErrorCmd) {
            throw new usb_1.UsbInvalidChannelId();
        }
        let result = Buffer.alloc(initPacket.length);
        let packetSequence = 0;
        let offset = 0;
        offset += initPacket.data.copy(result, offset);
        while (offset < initPacket.length) {
            continuationPacket.deserialize(Buffer.from(this.deviceHandle.readTimeout(30000)));
            if (this.cid.compare(continuationPacket.cid) !== 0) {
                throw new usb_1.UsbInvalidPacketSequence();
            }
            if (packetSequence !== continuationPacket.sequence) {
                throw new usb_1.UsbInvalidPacketSequence();
            }
            offset += continuationPacket.data.copy(result, offset);
            packetSequence++;
        }
        return { cmd: initPacket.cmd, data: result };
    }
    close() {
        this.deviceHandle.close();
        // usb.release();
    }
}
exports.Usb = Usb;
//# sourceMappingURL=usb.js.map