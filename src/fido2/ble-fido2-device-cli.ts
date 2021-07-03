import { Subject } from "rxjs";
import { Fido2Crypto } from "../crypto/crypto";
import { CtapStatusCode } from "../ctap2/status";
import { MethodNotImplemented } from "../errors/common";
import { Ctap2InvalidStatus, Ctap2InvalidCommand, Ctap1ErrChannelBusy, Ctap1ErrInvalidChannel, Ctap1ErrInvalidCommand, Ctap1ErrInvalidLength, Ctap1ErrInvalidParameter, Ctap1ErrInvalidSeq, Ctap1ErrLockRequired, Ctap1ErrOther, Ctap1ErrSuccess, Ctap1ErrTimeout, Ctap2ErrActionTimeout, Ctap2ErrCborUnexpectedType, Ctap2ErrCredentialExcluded, Ctap2ErrExtensionFirst, Ctap2ErrExtensionLast, Ctap2ErrFpDatabaseFull, Ctap2ErrIntegrityFailure, Ctap2ErrInvalidCbor, Ctap2ErrInvalidCredential, Ctap2ErrInvalidOption, Ctap2ErrInvalidSubcommand, Ctap2ErrKeepaliveCancel, Ctap2ErrKeyStoreFull, Ctap2ErrLargeBlobStorageFull, Ctap2ErrLimitExceeded, Ctap2ErrMissingParameter, Ctap2ErrNoCredentials, Ctap2ErrNoOperations, Ctap2ErrNotAllowed, Ctap2ErrOperationDenied, Ctap2ErrOperationPending, Ctap2ErrPinAuthBlocked, Ctap2ErrPinAuthInvalid, Ctap2ErrPinBlocked, Ctap2ErrPinInvalid, Ctap2ErrPinNotSet, Ctap2ErrPinPolicyViolation, Ctap2ErrProcessing, Ctap2ErrPuatRequired, Ctap2ErrRequestTooLarge, Ctap2ErrSpecLast, Ctap2ErrUnauthorizedPermission, Ctap2ErrUnsupportedAlgorithm, Ctap2ErrUnsupportedOption, Ctap2ErrUpRequired, Ctap2ErrUserActionPending, Ctap2ErrUserActionTimeout, Ctap2ErrUvBlocked, Ctap2ErrUvInvalid, Ctap2ErrVendorFirst, Ctap2ErrVendorLast, Ctap2ErrReserved, Ctap2PingDataMissmatch } from "../errors/ctap2";
import { logger } from "../log/debug";
import { Ble } from "../transports/ble/ble";
import { CtapBleCancelCmd, CtapBleCancelReq } from "../transports/ble/cmd/cancel";
import { CtapBleCborCmd, CtapBleCborReq, CtapBleCborRes } from "../transports/ble/cmd/cbor";
import { CtapBleErrorCmd, CtapBleErrorCode, CtapBleErrorRes } from "../transports/ble/cmd/error";
import { CtapBleKeepAliveCmd, CtapBleKeepAliveRes } from "../transports/ble/cmd/keep-alive";
import { CtapBlePingCmd, CtapBlePingReq, CtapBlePingRes } from "../transports/ble/cmd/ping";
import { Payload } from "../transports/transport";
import { IFido2DeviceCli } from "./fido2-device-cli";

const kMaxCommandTransmitDelayMillis = 1500;
const kErrorWaitMillis = 2000;
const kKeepAliveMillis = 500;

export class BleFido2DeviceCli implements IFido2DeviceCli {
    private device: Ble;
    private maxMsgSize: number
    private ongoingTransaction: boolean = false;

    constructor(uuid: string, maxPacketLength: number) {
        this.device = new Ble(uuid, maxPacketLength);
        this.maxMsgSize = 1024;
    }

    setMaxMsgSize(value: number): void {
        this.maxMsgSize = value;
    }

    private onSuccess(cbor: CtapBleCborRes): Buffer {
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

    private onError(code: CtapBleErrorCode): void {
        switch (code) {
            case CtapBleErrorCode.Busy:
                // throw new Ctap1ErrChannelBusy();
                break;
            case CtapBleErrorCode.InvalidCmd:
                throw new Ctap1ErrInvalidCommand();
            case CtapBleErrorCode.InvalidLen:
                throw new Ctap1ErrInvalidLength();
            case CtapBleErrorCode.InvalidPar:
                throw new Ctap1ErrInvalidParameter();
            case CtapBleErrorCode.InvalidSeq:
                throw new Ctap1ErrInvalidSeq();
            case CtapBleErrorCode.ReqTimeout:
                throw new Ctap1ErrTimeout();
            case CtapBleErrorCode.Other:
                throw new Ctap1ErrOther();
            default:
                break;
        }
    }

    msg(): void {
        throw new Error("Method not implemented.");
    }
    async cbor(payload: Payload, keepAlive?: Subject<number>): Promise<Buffer> {
        logger.debug(payload.cmd.toString(16), payload.data.toString('hex'));

        this.ongoingTransaction = true;

        /**
         * cbor fragment.
         */
        let fragment = new CtapBleCborReq().initialize(payload.cmd, payload.data).serialize();

        /**
         * Because some authenticators are memory constrained, do not send message larger than maxMsgSize. 
         */
        if (fragment.data.length > this.maxMsgSize) throw new Ctap2ErrRequestTooLarge();

        /**
         * Send cbor fragment.
         */
        await this.device.send(fragment);

        /**
         * Recv response.
         */
        while (true) {
            let ctap = await this.device.recv();
            logger.debug(ctap.cmd.toString(16), ctap.data.toString('hex'));
            switch (ctap.cmd) {
                case CtapBleCborCmd:
                    this.ongoingTransaction = false;
                    return this.onSuccess(new CtapBleCborRes().deserialize(ctap.data));
                case CtapBleErrorCmd:
                    this.onError(new CtapBleErrorRes().deserialize(ctap.data).code);
                    logger.debug('retry');
                    await new Promise(resolve => setTimeout(() => resolve(true), 1000));
                case CtapBleKeepAliveCmd: {
                    let ka = new CtapBleKeepAliveRes().deserialize(ctap.data);
                    keepAlive && keepAlive.next(ka.status);
                    await new Promise(resolve => setTimeout(() => resolve(true), kKeepAliveMillis));
                    continue;
                }
                case CtapBleCancelCmd:
                    this.ongoingTransaction = false;
                    throw new Ctap2ErrKeepaliveCancel();
                default:
                    this.ongoingTransaction = false;
                    throw new Ctap2InvalidCommand();
            }
        }
    }
    init(): void {
        throw new Error("Method not implemented.");
    }
    async ping(): Promise<bigint | undefined> {
        let nonce = Fido2Crypto.random(16);
        let pingFragment = new CtapBlePingReq(nonce);
        let start = process.hrtime.bigint();

        await this.device.send(pingFragment.serialize());

        let ctap = await this.device.recv();
        switch (ctap.cmd) {
            case CtapBlePingCmd: {
                let ping = new CtapBlePingRes().deserialize(ctap.data);
                if (ping.data.compare(nonce) !== 0) { throw new Ctap2PingDataMissmatch() }
                return (process.hrtime.bigint() - start) / 1000000n;
            }
            case CtapBleErrorCmd:
                this.onError(new CtapBleErrorRes().deserialize(ctap.data).code);
                break;
            default:
                throw new Ctap2InvalidCommand();
        }
    }
    async cancel(): Promise<void> {
        let fragment = new CtapBleCancelReq().initialize();
        this.ongoingTransaction && await this.device.send(fragment.serialize());
        let ctap = await this.device.recv();
        if (ctap.cmd !== CtapBleCancelCmd) throw new MethodNotImplemented();
        this.ongoingTransaction = false;
        logger.debug(111)
        return;
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