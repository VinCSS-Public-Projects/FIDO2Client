"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BleFido2DeviceCli = void 0;
const crypto_1 = require("../crypto/crypto");
const status_1 = require("../ctap2/status");
const common_1 = require("../errors/common");
const ctap2_1 = require("../errors/ctap2");
const debug_1 = require("../log/debug");
const ble_1 = require("../transports/ble/ble");
const cancel_1 = require("../transports/ble/cmd/cancel");
const cbor_1 = require("../transports/ble/cmd/cbor");
const error_1 = require("../transports/ble/cmd/error");
const keep_alive_1 = require("../transports/ble/cmd/keep-alive");
const ping_1 = require("../transports/ble/cmd/ping");
class BleFido2DeviceCli {
    constructor(uuid, maxPacketLength) {
        this.ongoingTransaction = false;
        this.device = new ble_1.Ble(uuid, maxPacketLength);
        this.maxMsgSize = 1024;
    }
    setMaxMsgSize(value) {
        this.maxMsgSize = value;
    }
    onSuccess(cbor) {
        switch (cbor.code) {
            case status_1.CtapStatusCode.Ctap1ErrSuccess:
                return cbor.data;
            case status_1.CtapStatusCode.Ctap2Ok:
                return cbor.data;
            case status_1.CtapStatusCode.Ctap1ErrInvalidCommand:
                throw new ctap2_1.Ctap1ErrInvalidCommand();
            case status_1.CtapStatusCode.Ctap1ErrInvalidParameter:
                throw new ctap2_1.Ctap1ErrInvalidParameter();
            case status_1.CtapStatusCode.Ctap1ErrInvalidLength:
                throw new ctap2_1.Ctap1ErrInvalidLength();
            case status_1.CtapStatusCode.Ctap1ErrInvalidSeq:
                throw new ctap2_1.Ctap1ErrInvalidSeq();
            case status_1.CtapStatusCode.Ctap1ErrTimeout:
                throw new ctap2_1.Ctap1ErrTimeout();
            case status_1.CtapStatusCode.Ctap1ErrChannelBusy:
                throw new ctap2_1.Ctap1ErrChannelBusy();
            case status_1.CtapStatusCode.Ctap1ErrLockRequired:
                throw new ctap2_1.Ctap1ErrLockRequired();
            case status_1.CtapStatusCode.Ctap1ErrInvalidChannel:
                throw new ctap2_1.Ctap1ErrInvalidChannel();
            case status_1.CtapStatusCode.Ctap2ErrCborUnexpectedType:
                throw new ctap2_1.Ctap2ErrCborUnexpectedType();
            case status_1.CtapStatusCode.Ctap2ErrInvalidCbor:
                throw new ctap2_1.Ctap2ErrInvalidCbor();
            case status_1.CtapStatusCode.Ctap2ErrMissingParameter:
                throw new ctap2_1.Ctap2ErrMissingParameter();
            case status_1.CtapStatusCode.Ctap2ErrLimitExceeded:
                throw new ctap2_1.Ctap2ErrLimitExceeded();
            case status_1.CtapStatusCode.Ctap2ErrFpDatabaseFull:
                throw new ctap2_1.Ctap2ErrFpDatabaseFull();
            case status_1.CtapStatusCode.Ctap2ErrLargeBlobStorageFull:
                throw new ctap2_1.Ctap2ErrLargeBlobStorageFull();
            case status_1.CtapStatusCode.Ctap2ErrCredentialExcluded:
                throw new ctap2_1.Ctap2ErrCredentialExcluded();
            case status_1.CtapStatusCode.Ctap2ErrProcessing:
                throw new ctap2_1.Ctap2ErrProcessing();
            case status_1.CtapStatusCode.Ctap2ErrInvalidCredential:
                throw new ctap2_1.Ctap2ErrInvalidCredential();
            case status_1.CtapStatusCode.Ctap2ErrUserActionPending:
                throw new ctap2_1.Ctap2ErrUserActionPending();
            case status_1.CtapStatusCode.Ctap2ErrOperationPending:
                throw new ctap2_1.Ctap2ErrOperationPending();
            case status_1.CtapStatusCode.Ctap2ErrNoOperations:
                throw new ctap2_1.Ctap2ErrNoOperations();
            case status_1.CtapStatusCode.Ctap2ErrUnsupportedAlgorithm:
                throw new ctap2_1.Ctap2ErrUnsupportedAlgorithm();
            case status_1.CtapStatusCode.Ctap2ErrOperationDenied:
                throw new ctap2_1.Ctap2ErrOperationDenied();
            case status_1.CtapStatusCode.Ctap2ErrKeyStoreFull:
                throw new ctap2_1.Ctap2ErrKeyStoreFull();
            case status_1.CtapStatusCode.Ctap2ErrUnsupportedOption:
                throw new ctap2_1.Ctap2ErrUnsupportedOption();
            case status_1.CtapStatusCode.Ctap2ErrInvalidOption:
                throw new ctap2_1.Ctap2ErrInvalidOption();
            case status_1.CtapStatusCode.Ctap2ErrKeepaliveCancel:
                throw new ctap2_1.Ctap2ErrKeepaliveCancel();
            case status_1.CtapStatusCode.Ctap2ErrNoCredentials:
                throw new ctap2_1.Ctap2ErrNoCredentials();
            case status_1.CtapStatusCode.Ctap2ErrUserActionTimeout:
                throw new ctap2_1.Ctap2ErrUserActionTimeout();
            case status_1.CtapStatusCode.Ctap2ErrNotAllowed:
                throw new ctap2_1.Ctap2ErrNotAllowed();
            case status_1.CtapStatusCode.Ctap2ErrPinInvalid:
                throw new ctap2_1.Ctap2ErrPinInvalid();
            case status_1.CtapStatusCode.Ctap2ErrPinBlocked:
                throw new ctap2_1.Ctap2ErrPinBlocked();
            case status_1.CtapStatusCode.Ctap2ErrPinAuthInvalid:
                throw new ctap2_1.Ctap2ErrPinAuthInvalid();
            case status_1.CtapStatusCode.Ctap2ErrPinAuthBlocked:
                throw new ctap2_1.Ctap2ErrPinAuthBlocked();
            case status_1.CtapStatusCode.Ctap2ErrPinNotSet:
                throw new ctap2_1.Ctap2ErrPinNotSet();
            case status_1.CtapStatusCode.Ctap2ErrPuatRequired:
                throw new ctap2_1.Ctap2ErrPuatRequired();
            case status_1.CtapStatusCode.Ctap2ErrPinPolicyViolation:
                throw new ctap2_1.Ctap2ErrPinPolicyViolation();
            case status_1.CtapStatusCode.Reserved:
                throw new ctap2_1.Ctap2ErrReserved();
            case status_1.CtapStatusCode.Ctap2ErrRequestTooLarge:
                throw new ctap2_1.Ctap2ErrRequestTooLarge();
            case status_1.CtapStatusCode.Ctap2ErrActionTimeout:
                throw new ctap2_1.Ctap2ErrActionTimeout();
            case status_1.CtapStatusCode.Ctap2ErrUpRequired:
                throw new ctap2_1.Ctap2ErrUpRequired();
            case status_1.CtapStatusCode.Ctap2ErrUvBlocked:
                throw new ctap2_1.Ctap2ErrUvBlocked();
            case status_1.CtapStatusCode.Ctap2ErrIntegrityFailure:
                throw new ctap2_1.Ctap2ErrIntegrityFailure();
            case status_1.CtapStatusCode.Ctap2ErrInvalidSubcommand:
                throw new ctap2_1.Ctap2ErrInvalidSubcommand();
            case status_1.CtapStatusCode.Ctap2ErrUvInvalid:
                throw new ctap2_1.Ctap2ErrUvInvalid();
            case status_1.CtapStatusCode.Ctap2ErrUnauthorizedPermission:
                throw new ctap2_1.Ctap2ErrUnauthorizedPermission();
            case status_1.CtapStatusCode.Ctap1ErrOther:
                throw new ctap2_1.Ctap1ErrOther();
            case status_1.CtapStatusCode.Ctap2ErrSpecLast:
                throw new ctap2_1.Ctap2ErrSpecLast();
            case status_1.CtapStatusCode.Ctap2ErrExtensionFirst:
                throw new ctap2_1.Ctap2ErrExtensionFirst();
            case status_1.CtapStatusCode.Ctap2ErrExtensionLast:
                throw new ctap2_1.Ctap2ErrExtensionLast();
            case status_1.CtapStatusCode.Ctap2ErrVendorFirst:
                throw new ctap2_1.Ctap2ErrVendorFirst();
            case status_1.CtapStatusCode.Ctap2ErrVendorLast:
                throw new ctap2_1.Ctap2ErrVendorLast();
            default:
                throw new ctap2_1.Ctap2InvalidStatus();
        }
    }
    onError(code) {
        switch (code) {
            case error_1.CtapBleErrorCode.Busy:
                // throw new Ctap1ErrChannelBusy();
                break;
            case error_1.CtapBleErrorCode.InvalidCmd:
                throw new ctap2_1.Ctap1ErrInvalidCommand();
            case error_1.CtapBleErrorCode.InvalidLen:
                throw new ctap2_1.Ctap1ErrInvalidLength();
            case error_1.CtapBleErrorCode.InvalidPar:
                throw new ctap2_1.Ctap1ErrInvalidParameter();
            case error_1.CtapBleErrorCode.InvalidSeq:
                throw new ctap2_1.Ctap1ErrInvalidSeq();
            case error_1.CtapBleErrorCode.ReqTimeout:
                throw new ctap2_1.Ctap1ErrTimeout();
            case error_1.CtapBleErrorCode.Other:
                throw new ctap2_1.Ctap1ErrOther();
            default:
                break;
        }
    }
    msg() {
        throw new Error("Method not implemented.");
    }
    async cbor(payload, keepAlive) {
        debug_1.logger.debug(payload.cmd.toString(16), payload.data.toString('hex'));
        this.ongoingTransaction = true;
        /**
         * cbor fragment.
         */
        let fragment = new cbor_1.CtapBleCborReq().initialize(payload.cmd, payload.data).serialize();
        /**
         * Because some authenticators are memory constrained, do not send message larger than maxMsgSize.
         */
        if (fragment.data.length > this.maxMsgSize)
            throw new ctap2_1.Ctap2ErrRequestTooLarge();
        /**
         * Send cbor fragment.
         */
        await this.device.send(fragment);
        /**
         * Recv response.
         */
        while (true) {
            let ctap = await this.device.recv();
            debug_1.logger.debug(ctap.cmd.toString(16), ctap.data.toString('hex'));
            switch (ctap.cmd) {
                case cbor_1.CtapBleCborCmd:
                    this.ongoingTransaction = false;
                    return this.onSuccess(new cbor_1.CtapBleCborRes().deserialize(ctap.data));
                case error_1.CtapBleErrorCmd:
                    this.onError(new error_1.CtapBleErrorRes().deserialize(ctap.data).code);
                    debug_1.logger.debug('retry');
                    await new Promise((resolve) => { setTimeout(() => { resolve(true); }, 1000); });
                case keep_alive_1.CtapBleKeepAliveCmd: {
                    let ka = new keep_alive_1.CtapBleKeepAliveRes().deserialize(ctap.data);
                    keepAlive && keepAlive(ka.status);
                    continue;
                }
                case cancel_1.CtapBleCancelCmd:
                    this.ongoingTransaction = false;
                    throw new ctap2_1.Ctap2ErrKeepaliveCancel();
                default:
                    this.ongoingTransaction = false;
                    throw new ctap2_1.Ctap2InvalidCommand();
            }
        }
    }
    init() {
        throw new Error("Method not implemented.");
    }
    async ping() {
        let nonce = crypto_1.Fido2Crypto.random(16);
        let pingFragment = new ping_1.CtapBlePingReq(nonce);
        let start = process.hrtime.bigint();
        await this.device.send(pingFragment.serialize());
        let ctap = await this.device.recv();
        switch (ctap.cmd) {
            case ping_1.CtapBlePingCmd: {
                let ping = new ping_1.CtapBlePingRes().deserialize(ctap.data);
                if (ping.data.compare(nonce) !== 0) {
                    throw new ctap2_1.Ctap2PingDataMissmatch();
                }
                return (process.hrtime.bigint() - start) / 1000000n;
            }
            case error_1.CtapBleErrorCmd:
                this.onError(new error_1.CtapBleErrorRes().deserialize(ctap.data).code);
                break;
            default:
                throw new ctap2_1.Ctap2InvalidCommand();
        }
    }
    async cancel() {
        let fragment = new cancel_1.CtapBleCancelReq().initialize();
        this.ongoingTransaction && await this.device.send(fragment.serialize());
        let ctap = await this.device.recv();
        if (ctap.cmd !== cancel_1.CtapBleCancelCmd)
            throw new common_1.MethodNotImplemented();
        this.ongoingTransaction = false;
        return;
    }
    keepAlive() {
        throw new Error("Method not implemented.");
    }
    wink() {
        throw new Error("Method not implemented.");
    }
    lock() {
        throw new Error("Method not implemented.");
    }
    close() {
        this.device.close();
    }
}
exports.BleFido2DeviceCli = BleFido2DeviceCli;
