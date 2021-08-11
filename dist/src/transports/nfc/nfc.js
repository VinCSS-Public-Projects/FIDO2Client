"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nfc = void 0;
const common_1 = require("../../errors/common");
const debug_1 = require("../../log/debug");
const service_1 = require("./service");
const fragment_1 = require("./fragment");
const operators_1 = require("rxjs/operators");
const cbor_1 = require("./cmd/cbor");
const keep_alive_1 = require("./cmd/keep-alive");
const nfc_1 = require("../../errors/nfc");
class Nfc {
    constructor(type, name) {
        /**
         * @TODO find a way to determine fragment size. Currently using the minimum value.
         */
        this.maxFragmentLength = 0x80;
        switch (type) {
            case 'CCID':
                this.deviceHandle = new service_1.CCID(service_1.nfc.getCard(`${type}-${name}`).reader);
                break;
            default:
                throw new common_1.MethodNotImplemented();
        }
    }
    static async device() {
        await service_1.nfc.start();
        return service_1.nfc.observable.pipe(operators_1.finalize(() => service_1.nfc.stop()));
    }
    static async release() {
        await service_1.nfc.release();
        return;
    }
    async send(payload) {
        let status = 0;
        if (payload.data.length <= this.maxFragmentLength) {
            let fragment = new fragment_1.Fragment().initialize(fragment_1.InstructionClass.Command, fragment_1.InstructionCode.NfcCtapMsg, 0x80, 0, payload.data);
            status = await this.deviceHandle.send(fragment.serialize());
        }
        else {
            let offset = 0;
            while (offset < payload.data.length) {
                let chain = payload.data.slice(offset, offset + this.maxFragmentLength);
                offset += chain.length;
                let cls = offset >= payload.data.length ? fragment_1.InstructionClass.Command : fragment_1.InstructionClass.Chaining;
                let fragment = new fragment_1.Fragment().initialize(cls, fragment_1.InstructionCode.NfcCtapMsg, 0x80, 0, chain);
                status = await this.deviceHandle.send(fragment.serialize());
            }
        }
    }
    async recv() {
        let fragments = [];
        while (true) {
            let data = await this.deviceHandle.recv();
            let status = data.readUInt16BE(data.length - 2);
            let buff = data.slice(0, data.length - 2);
            switch (status & 0xff00) {
                case 0x9000: {
                    fragments.push(buff);
                    return { cmd: cbor_1.CtapNfcCborCmd, data: Buffer.concat(fragments) };
                }
                case 0x6100:
                    let grsp = new fragment_1.Fragment().initialize(fragment_1.InstructionClass.Command, fragment_1.InstructionCode.NfcCtapUnknown, 0, 0, undefined, status & 0xff);
                    await this.deviceHandle.send(grsp.serialize());
                    fragments.push(buff);
                    continue;
                case 0x9100: {
                    let gRsp = new fragment_1.Fragment().initialize(fragment_1.InstructionClass.Command, fragment_1.InstructionCode.NfcCtapGetResponse, 0, 0, undefined);
                    await this.deviceHandle.send(gRsp.serialize());
                    return { cmd: keep_alive_1.CtapNfcKeepAliveCmd, data: buff };
                }
                default:
                    debug_1.logger.debug(`nfc status ${status.toString(16)}`);
                    // TODO: handle other error
                    throw new nfc_1.NfcInvalidStatusCode();
            }
        }
    }
    close() {
        // NfcSvc.turnOff();
    }
}
exports.Nfc = Nfc;
