import { CtapStatusCode } from "../ctap2/status";
import { Ctap1ErrChannelBusy, Ctap1ErrInvalidChannel, Ctap1ErrInvalidCommand, Ctap1ErrInvalidLength, Ctap1ErrInvalidParameter, Ctap1ErrInvalidSeq, Ctap1ErrLockRequired, Ctap1ErrOther, Ctap1ErrTimeout, Ctap2ErrActionTimeout, Ctap2ErrCborUnexpectedType, Ctap2ErrCredentialExcluded, Ctap2ErrExtensionFirst, Ctap2ErrExtensionLast, Ctap2ErrFpDatabaseFull, Ctap2ErrIntegrityFailure, Ctap2ErrInvalidCbor, Ctap2ErrInvalidCredential, Ctap2ErrInvalidOption, Ctap2ErrInvalidSubcommand, Ctap2ErrKeepaliveCancel, Ctap2ErrKeyStoreFull, Ctap2ErrLargeBlobStorageFull, Ctap2ErrLimitExceeded, Ctap2ErrMissingParameter, Ctap2ErrNoCredentials, Ctap2ErrNoOperations, Ctap2ErrNotAllowed, Ctap2ErrOperationDenied, Ctap2ErrOperationPending, Ctap2ErrPinAuthBlocked, Ctap2ErrPinAuthInvalid, Ctap2ErrPinBlocked, Ctap2ErrPinInvalid, Ctap2ErrPinNotSet, Ctap2ErrPinPolicyViolation, Ctap2ErrProcessing, Ctap2ErrPuatRequired, Ctap2ErrRequestTooLarge, Ctap2ErrReserved, Ctap2ErrSpecLast, Ctap2ErrUnauthorizedPermission, Ctap2ErrUnsupportedAlgorithm, Ctap2ErrUnsupportedOption, Ctap2ErrUpRequired, Ctap2ErrUserActionPending, Ctap2ErrUserActionTimeout, Ctap2ErrUvBlocked, Ctap2ErrUvInvalid, Ctap2ErrVendorFirst, Ctap2ErrVendorLast, Ctap2InvalidCommand, Ctap2InvalidStatus } from "../errors/ctap2";
import { CtapNfcCborCmd, CtapNfcCborReq, CtapNfcCborRes } from "../transports/nfc/cmd/cbor";
import { CtapNfcErrorCode } from "../transports/nfc/cmd/error";
import { NfcType } from "../transports/nfc/service";
import { Nfc } from "../transports/nfc/nfc";
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";
import { logger } from "../log/debug";
import { Subject } from "rxjs/internal/Subject";
import { CtapNfcKeepAliveCmd, CtapNfcKeepAliveRes } from "../transports/nfc/cmd/keep-alive";

export class NfcFido2DeviceCli implements IFido2DeviceCli {
    private device: Nfc;
    private maxMsgSize: number;
    private ongoingTransaction: boolean;

    constructor(type?: NfcType, name?: string) {
        this.device = new Nfc(type, name);
        this.maxMsgSize = 1024;
        this.ongoingTransaction = false;
    }

    setMaxMsgSize(value: number): void {
        this.maxMsgSize = value;
    }

    private onError(code: CtapNfcErrorCode): void {
        switch (code) {
            case CtapNfcErrorCode.Busy:
                // throw new Ctap1ErrChannelBusy();
                break;
            case CtapNfcErrorCode.InvalidCmd:
                throw new Ctap1ErrInvalidCommand();
            case CtapNfcErrorCode.InvalidLen:
                throw new Ctap1ErrInvalidLength();
            case CtapNfcErrorCode.InvalidPar:
                throw new Ctap1ErrInvalidParameter();
            case CtapNfcErrorCode.InvalidSeq:
                throw new Ctap1ErrInvalidSeq();
            case CtapNfcErrorCode.ReqTimeout:
                throw new Ctap1ErrTimeout();
            case CtapNfcErrorCode.Other:
                throw new Ctap1ErrOther();
            default:
                break;
        }
    }

    private onSuccess(cbor: CtapNfcCborRes): Buffer {
        switch (cbor.code) {
            case CtapStatusCode.Ctap1ErrSuccess:
                return cbor.data;
            case CtapStatusCode.Ctap2Ok:
                return cbor.data;
            case CtapStatusCode.Ctap1ErrInvalidCommand:
                throw new Ctap1ErrInvalidCommand();
            case CtapStatusCode.Ctap1ErrInvalidParameter:
                throw new Ctap1ErrInvalidParameter();
            case CtapStatusCode.Ctap1ErrInvalidLength:
                throw new Ctap1ErrInvalidLength();
            case CtapStatusCode.Ctap1ErrInvalidSeq:
                throw new Ctap1ErrInvalidSeq();
            case CtapStatusCode.Ctap1ErrTimeout:
                throw new Ctap1ErrTimeout();
            case CtapStatusCode.Ctap1ErrChannelBusy:
                throw new Ctap1ErrChannelBusy();
            case CtapStatusCode.Ctap1ErrLockRequired:
                throw new Ctap1ErrLockRequired();
            case CtapStatusCode.Ctap1ErrInvalidChannel:
                throw new Ctap1ErrInvalidChannel();
            case CtapStatusCode.Ctap2ErrCborUnexpectedType:
                throw new Ctap2ErrCborUnexpectedType();
            case CtapStatusCode.Ctap2ErrInvalidCbor:
                throw new Ctap2ErrInvalidCbor();
            case CtapStatusCode.Ctap2ErrMissingParameter:
                throw new Ctap2ErrMissingParameter();
            case CtapStatusCode.Ctap2ErrLimitExceeded:
                throw new Ctap2ErrLimitExceeded();
            case CtapStatusCode.Ctap2ErrFpDatabaseFull:
                throw new Ctap2ErrFpDatabaseFull();
            case CtapStatusCode.Ctap2ErrLargeBlobStorageFull:
                throw new Ctap2ErrLargeBlobStorageFull();
            case CtapStatusCode.Ctap2ErrCredentialExcluded:
                throw new Ctap2ErrCredentialExcluded();
            case CtapStatusCode.Ctap2ErrProcessing:
                throw new Ctap2ErrProcessing();
            case CtapStatusCode.Ctap2ErrInvalidCredential:
                throw new Ctap2ErrInvalidCredential();
            case CtapStatusCode.Ctap2ErrUserActionPending:
                throw new Ctap2ErrUserActionPending();
            case CtapStatusCode.Ctap2ErrOperationPending:
                throw new Ctap2ErrOperationPending();
            case CtapStatusCode.Ctap2ErrNoOperations:
                throw new Ctap2ErrNoOperations();
            case CtapStatusCode.Ctap2ErrUnsupportedAlgorithm:
                throw new Ctap2ErrUnsupportedAlgorithm();
            case CtapStatusCode.Ctap2ErrOperationDenied:
                throw new Ctap2ErrOperationDenied();
            case CtapStatusCode.Ctap2ErrKeyStoreFull:
                throw new Ctap2ErrKeyStoreFull();
            case CtapStatusCode.Ctap2ErrUnsupportedOption:
                throw new Ctap2ErrUnsupportedOption();
            case CtapStatusCode.Ctap2ErrInvalidOption:
                throw new Ctap2ErrInvalidOption();
            case CtapStatusCode.Ctap2ErrKeepaliveCancel:
                throw new Ctap2ErrKeepaliveCancel();
            case CtapStatusCode.Ctap2ErrNoCredentials:
                throw new Ctap2ErrNoCredentials();
            case CtapStatusCode.Ctap2ErrUserActionTimeout:
                throw new Ctap2ErrUserActionTimeout();
            case CtapStatusCode.Ctap2ErrNotAllowed:
                throw new Ctap2ErrNotAllowed();
            case CtapStatusCode.Ctap2ErrPinInvalid:
                throw new Ctap2ErrPinInvalid();
            case CtapStatusCode.Ctap2ErrPinBlocked:
                throw new Ctap2ErrPinBlocked();
            case CtapStatusCode.Ctap2ErrPinAuthInvalid:
                throw new Ctap2ErrPinAuthInvalid();
            case CtapStatusCode.Ctap2ErrPinAuthBlocked:
                throw new Ctap2ErrPinAuthBlocked();
            case CtapStatusCode.Ctap2ErrPinNotSet:
                throw new Ctap2ErrPinNotSet();
            case CtapStatusCode.Ctap2ErrPuatRequired:
                throw new Ctap2ErrPuatRequired();
            case CtapStatusCode.Ctap2ErrPinPolicyViolation:
                throw new Ctap2ErrPinPolicyViolation();
            case CtapStatusCode.Reserved:
                throw new Ctap2ErrReserved();
            case CtapStatusCode.Ctap2ErrRequestTooLarge:
                throw new Ctap2ErrRequestTooLarge();
            case CtapStatusCode.Ctap2ErrActionTimeout:
                throw new Ctap2ErrActionTimeout();
            case CtapStatusCode.Ctap2ErrUpRequired:
                throw new Ctap2ErrUpRequired();
            case CtapStatusCode.Ctap2ErrUvBlocked:
                throw new Ctap2ErrUvBlocked();
            case CtapStatusCode.Ctap2ErrIntegrityFailure:
                throw new Ctap2ErrIntegrityFailure();
            case CtapStatusCode.Ctap2ErrInvalidSubcommand:
                throw new Ctap2ErrInvalidSubcommand();
            case CtapStatusCode.Ctap2ErrUvInvalid:
                throw new Ctap2ErrUvInvalid();
            case CtapStatusCode.Ctap2ErrUnauthorizedPermission:
                throw new Ctap2ErrUnauthorizedPermission();
            case CtapStatusCode.Ctap1ErrOther:
                throw new Ctap1ErrOther();
            case CtapStatusCode.Ctap2ErrSpecLast:
                throw new Ctap2ErrSpecLast();
            case CtapStatusCode.Ctap2ErrExtensionFirst:
                throw new Ctap2ErrExtensionFirst();
            case CtapStatusCode.Ctap2ErrExtensionLast:
                throw new Ctap2ErrExtensionLast();
            case CtapStatusCode.Ctap2ErrVendorFirst:
                throw new Ctap2ErrVendorFirst();
            case CtapStatusCode.Ctap2ErrVendorLast:
                throw new Ctap2ErrVendorLast();

            default:
                throw new Ctap2InvalidStatus();
        }
    }
    msg(): void {
        throw new Error("Method not implemented.");
    }
    async cbor(payload: Payload, keepAlive?: Subject<number>): Promise<Buffer> {
        logger.debug(payload.cmd.toString(16), payload.data.toString('hex'));

        /**
         * cbor fragment.
         */
        let fragment = new CtapNfcCborReq().initialize(payload.cmd, payload.data).serialize();

        /**
         * Because some authenticators are memory constrained, do not send message larger than maxMsgSize. 
         */
        if (fragment.data.length > this.maxMsgSize) throw new Ctap2ErrRequestTooLarge();

        /**
         * Send cbor fragment.
         */
        await this.device.send(fragment);

        /**
         * Recv response fragment.
         */
        while (true) {
            let ctap = await this.device.recv();
            logger.debug(ctap);
            switch (ctap.cmd) {
                case CtapNfcCborCmd:
                    this.ongoingTransaction = false;
                    return this.onSuccess(new CtapNfcCborRes().deserialize(ctap.data));
                case CtapNfcKeepAliveCmd: {
                    let ka = new CtapNfcKeepAliveRes().deserialize(ctap.data);
                    keepAlive && keepAlive.next(ka.status);
                    continue;
                }
                default:
                    throw new Ctap2InvalidCommand();
            }
        }

    }
    init(): void {
        throw new Error("Method not implemented.");
    }
    async ping(): Promise<bigint | undefined> {
        /**
         * @TODO ping not available on nfc transport yet.
         */
        return 1n;
    }
    async cancel(): Promise<void> {
        // throw new Error("Method not implemented.");
    }
    keepAlive(): void {
        throw new Error("Method not implemented.");
    }
    wink(): void {
        throw new Error("Method not implemented.");
    }
    lock(): void {
        throw new Error("Method not implemented.");
    }
    close(): void {
        this.device.close();
    }
}