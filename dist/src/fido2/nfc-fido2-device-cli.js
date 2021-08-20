"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfcFido2DeviceCli = void 0;
const status_1 = require("../ctap2/status");
const ctap2_1 = require("../errors/ctap2");
const cbor_1 = require("../transports/nfc/cmd/cbor");
const error_1 = require("../transports/nfc/cmd/error");
const nfc_1 = require("../transports/nfc/nfc");
const debug_1 = require("../log/debug");
const keep_alive_1 = require("../transports/nfc/cmd/keep-alive");
class NfcFido2DeviceCli {
    constructor(type, name) {
        this.device = new nfc_1.Nfc(type, name);
        this.maxMsgSize = 1024;
        this.ongoingTransaction = false;
    }
    setMaxMsgSize(value) {
        this.maxMsgSize = value;
    }
    onError(code) {
        switch (code) {
            case error_1.CtapNfcErrorCode.Busy:
                // throw new Ctap1ErrChannelBusy();
                break;
            case error_1.CtapNfcErrorCode.InvalidCmd:
                throw new ctap2_1.Ctap1ErrInvalidCommand();
            case error_1.CtapNfcErrorCode.InvalidLen:
                throw new ctap2_1.Ctap1ErrInvalidLength();
            case error_1.CtapNfcErrorCode.InvalidPar:
                throw new ctap2_1.Ctap1ErrInvalidParameter();
            case error_1.CtapNfcErrorCode.InvalidSeq:
                throw new ctap2_1.Ctap1ErrInvalidSeq();
            case error_1.CtapNfcErrorCode.ReqTimeout:
                throw new ctap2_1.Ctap1ErrTimeout();
            case error_1.CtapNfcErrorCode.Other:
                throw new ctap2_1.Ctap1ErrOther();
            default:
                break;
        }
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
    msg() {
        throw new Error("Method not implemented.");
    }
    async cbor(payload, keepAlive) {
        debug_1.logger.debug(payload.cmd.toString(16), payload.data.toString('hex'));
        /**
         * cbor fragment.
         */
        let fragment = new cbor_1.CtapNfcCborReq().initialize(payload.cmd, payload.data).serialize();
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
         * Recv response fragment.
         */
        while (true) {
            let ctap = await this.device.recv();
            debug_1.logger.debug(ctap);
            switch (ctap.cmd) {
                case cbor_1.CtapNfcCborCmd:
                    this.ongoingTransaction = false;
                    return this.onSuccess(new cbor_1.CtapNfcCborRes().deserialize(ctap.data));
                case keep_alive_1.CtapNfcKeepAliveCmd: {
                    let ka = new keep_alive_1.CtapNfcKeepAliveRes().deserialize(ctap.data);
                    keepAlive && keepAlive.next(ka.status);
                    continue;
                }
                default:
                    throw new ctap2_1.Ctap2InvalidCommand();
            }
        }
    }
    init() {
        throw new Error("Method not implemented.");
    }
    async ping() {
        /**
         * @TODO ping not available on nfc transport yet.
         */
        return 1n;
    }
    async cancel() {
        // throw new Error("Method not implemented.");
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
exports.NfcFido2DeviceCli = NfcFido2DeviceCli;
//# sourceMappingURL=nfc-fido2-device-cli.js.map