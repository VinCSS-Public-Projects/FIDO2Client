"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HidFido2DeviceCli = void 0;
const ctap2_1 = require("../errors/ctap2");
const cbor_1 = require("../transports/usb/cmd/cbor");
const error_1 = require("../transports/usb/cmd/error");
const keep_alive_1 = require("../transports/usb/cmd/keep-alive");
const usb_1 = require("../transports/usb/usb");
const status_1 = require("../ctap2/status");
const crypto_1 = require("../crypto/crypto");
const ping_1 = require("../transports/usb/cmd/ping");
const debug_1 = require("../log/debug");
const cancel_1 = require("../transports/usb/cmd/cancel");
const kKeepAliveMillis = 100;
class HidFido2DeviceCli {
    constructor(path, maxPacketLength) {
        this.device = new usb_1.Usb(path, maxPacketLength);
        this.maxMsgSize = 1024;
        this.ongoingTransaction = false;
    }
    setMaxMsgSize(value) {
        this.maxMsgSize = value;
    }
    msg() {
        throw new Error("Method not implemented.");
    }
    async cbor(payload, keepAlive) {
        debug_1.logger.debug(payload.cmd.toString(16), payload.data.toString('hex'));
        /**
         * Update transaction status.
         */
        this.ongoingTransaction = true;
        /**
         * cbor packet.
         */
        let packet = new cbor_1.CtapHidCborReq(payload.cmd, payload.data).serialize();
        /**
         * Because some authenticators are memory constrained, do not send message larger than maxMsgSize.
         */
        if (packet.data.length > this.maxMsgSize)
            throw new ctap2_1.Ctap2ErrRequestTooLarge();
        /**
         * Send cbor packet.
         */
        await this.device.send(packet);
        /**
         * Loop.
         */
        while (true) {
            /**
             * Recv packet.
             */
            let ctap = await this.device.recv();
            debug_1.logger.debug(ctap.cmd.toString(16), ctap.data.toString('hex'));
            /**
             * Process packet.
             */
            switch (ctap.cmd) {
                /**
                 * Cbor command.
                 */
                case cbor_1.CtapHidCborCmd:
                    this.ongoingTransaction = false;
                    return this.onCbor(new cbor_1.CtapHidCborRes().deserialize(ctap.data));
                /**
                 * Error.
                 */
                case error_1.CtapHidErrorCmd:
                    this.onError(new error_1.CtapHidErrorRes().deserialize(ctap.data).code);
                    debug_1.logger.debug('retry');
                    await new Promise(resolve => setTimeout(() => resolve(true), 1000));
                /**
                 * Keep alive.
                 */
                case keep_alive_1.CtapHidKeepAliveCmd: {
                    let ka = new keep_alive_1.CtapHidKeepAliveRes().deserialize(ctap.data);
                    keepAlive && keepAlive.next(ka.code);
                    await new Promise(resolve => setTimeout(() => resolve(true), kKeepAliveMillis));
                    continue;
                }
                /**
                 * Unhandled command.
                 * Emit an issue on https://github.com/VinCSS-Public-Projects/FIDO2Client/issues
                 */
                default:
                    throw new ctap2_1.Ctap2InvalidCommand();
            }
        }
    }
    init() {
        throw new Error("Method not implemented.");
    }
    async ping() {
        let data = crypto_1.Fido2Crypto.random(16);
        let pingPacket = new ping_1.CtapHidPingReq(data);
        let start = process.hrtime.bigint();
        await this.device.send(pingPacket.serialize());
        while (true) {
            let ctap = await this.device.recv();
            switch (ctap.cmd) {
                case ping_1.CtapHidPingCmd: {
                    let ping = new ping_1.CtapHidPingRes().deserialize(ctap.data);
                    if (ping.data.compare(data) !== 0) {
                        throw new ctap2_1.Ctap2PingDataMissmatch();
                    }
                    return (process.hrtime.bigint() - start) / 1000000n;
                }
                case error_1.CtapHidErrorCmd:
                    this.onError(new error_1.CtapHidErrorRes().deserialize(ctap.data).code);
                    break;
                case keep_alive_1.CtapHidKeepAliveCmd: {
                    let keepAlive = new keep_alive_1.CtapHidKeepAliveRes().deserialize(ctap.data);
                    debug_1.logger.debug(keepAlive);
                    continue;
                }
                default:
                    throw new ctap2_1.Ctap2InvalidCommand();
            }
        }
    }
    async cancel() {
        /**
         * Create cancel request.
         */
        let packet = new cancel_1.CtapHidCancelReq();
        /**
         * Send cancel request.
         */
        this.ongoingTransaction && await this.device.send(packet.serialize());
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
    onCbor(cbor) {
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
            case error_1.CtapHidErrorCode.ChannelBusy:
                // throw new Ctap1ErrChannelBusy();
                break;
            case error_1.CtapHidErrorCode.InvalidChannel:
                throw new ctap2_1.Ctap1ErrInvalidChannel();
            case error_1.CtapHidErrorCode.InvalidCmd:
                throw new ctap2_1.Ctap1ErrInvalidCommand();
            case error_1.CtapHidErrorCode.InvalidLen:
                throw new ctap2_1.Ctap1ErrInvalidLength();
            case error_1.CtapHidErrorCode.InvalidPar:
                throw new ctap2_1.Ctap1ErrInvalidParameter();
            case error_1.CtapHidErrorCode.InvalidSeq:
                throw new ctap2_1.Ctap1ErrInvalidSeq();
            case error_1.CtapHidErrorCode.LockRequired:
                throw new ctap2_1.Ctap1ErrLockRequired();
            case error_1.CtapHidErrorCode.MsgTimeout:
                throw new ctap2_1.Ctap1ErrTimeout();
            case error_1.CtapHidErrorCode.Other:
                throw new ctap2_1.Ctap1ErrOther();
            default:
                break;
        }
    }
    close() {
        this.device.close();
    }
}
exports.HidFido2DeviceCli = HidFido2DeviceCli;
//# sourceMappingURL=hid-fido2-device-cli.js.map