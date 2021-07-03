import { Fido2Crypto } from "../../crypto/crypto";
import { UsbCmdInitNonceMismatch, UsbCmdMismatch, UsbDeviceBusy, UsbDeviceNotCompatibleFido, UsbInvalidChannelId, UsbInvalidPacketSequence, UsbUnsupportedOnPlatform } from "../../errors/usb";
import { Payload, Transport } from "../transport";
import { CtapHidInitReq, CtapHidInitRes } from "./cmd/init";
import { HID } from 'node-hid';
import { IFido2Device } from "../../fido2/fido2-device-cli";
import { logger } from "../../log/debug";
import { CtapHidErrorCmd } from "./cmd/error";
import { Observable } from "rxjs";
import { usb } from "./service";
import { CtapHidBroadcastCid, CtapHidChannelBusy, CtapHidContinuationPacket, CtapHidInitPacket } from "./packet";
import { finalize } from "rxjs/operators";

export enum CtapHidCmd {
    Msg = 0x3,
    Cbor = 0x10,
    Init = 0x6,
    Ping = 0x1,
    Cancel = 0x11,
    Error = 0x3f,
    KeepAlive = 0x3b,
    Wink = 0x8,
    Lock = 0x4
}

export enum CtapHidCapBit {
    Wink = 0x1,
    Cbor = 0x4,
    Nmsg = 0x8
}

export interface IUsbCmd {
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}

type Status = 'initializing' | 'initialized' | 'unavailable';

export class Usb implements Transport {
    private deviceHandle: HID;
    private cid: Buffer;
    ctapVersion!: number;
    deviceMajor!: number;
    deviceMinor!: number;
    deviceBuild!: number;
    deviceCapabilities!: number;
    private maxPacketLength: number;
    private initPacketLength: number;
    private continuationPacketLength: number;
    private status!: Status;

    constructor(devciePath: string, maxPacketLength: number) {
        this.cid = CtapHidBroadcastCid;
        this.deviceHandle = new HID(devciePath);
        this.deviceHandle.on('error', (e) => {
            logger.error(e);
        });
        this.maxPacketLength = maxPacketLength;
        this.initPacketLength = this.maxPacketLength - 7;
        this.continuationPacketLength = this.maxPacketLength - 5;
        this.status = 'unavailable';
    }
    static async device(): Promise<Observable<IFido2Device>> {
        await usb.start();
        return usb.observable.pipe(finalize(() => usb.stop()));
    }
    static async release(): Promise<void> {
        await usb.release();
        return;
    }
    private internalSend(data: Buffer): number {
        switch (process.platform) {
            case 'win32':
                return this.deviceHandle.write(Buffer.concat([Buffer.alloc(1), data]));
            case 'darwin':
                return this.deviceHandle.write(Buffer.concat([Buffer.alloc(data[0] === 0x00 ? 1 : 0), data]));
            case 'linux':
                return this.deviceHandle.write(data);
            default:
                throw new UsbUnsupportedOnPlatform();
        }
    }
    private async init(): Promise<void> {
        logger.debug('init');
        this.status = 'initializing';
        let nonce = Fido2Crypto.random(8);
        await this.send(new CtapHidInitReq(nonce).serialize());

        let ctap = await this.recv();
        logger.debug(ctap.cmd.toString(16), ctap.data.toString('hex'));
        if (ctap.cmd === CtapHidCmd.Error && ctap.data.compare(CtapHidChannelBusy) === 0) { throw new UsbDeviceBusy(); }
        if (ctap.cmd !== CtapHidCmd.Init) { throw new UsbCmdMismatch(); }

        let init = new CtapHidInitRes().deserialize(ctap.data);
        if (init.nonce.compare(nonce) !== 0) throw new UsbCmdInitNonceMismatch();

        this.cid = init.cid;
        this.ctapVersion = init.ctapVersion;
        this.deviceBuild = init.deviceBuild;
        this.deviceMinor = init.deviceMinor;
        this.deviceMajor = init.deviceMajor;
        this.deviceCapabilities = init.deviceCapabilities;

        if ((this.deviceCapabilities & CtapHidCapBit.Cbor) === 0) throw new UsbDeviceNotCompatibleFido();

        this.status = 'initialized';
    }
    async send(payload: Payload): Promise<void> {
        if (this.status === 'unavailable') await this.init();
        let initPacketBuff = Buffer.alloc(this.initPacketLength);
        let continuationPacketBuff = Buffer.alloc(this.continuationPacketLength);
        let offset = 0;

        offset += payload.data.copy(initPacketBuff, 0, offset);
        let initPacket = new CtapHidInitPacket(this.maxPacketLength);
        let buffer = initPacket.initialize(this.cid, payload.cmd, payload.data.length, initPacketBuff).serialize();

        this.internalSend(buffer);

        let packetSequence = 0;
        while (offset < payload.data.length) {
            continuationPacketBuff.fill(0);
            offset += payload.data.copy(continuationPacketBuff, 0, offset);
            this.internalSend(new CtapHidContinuationPacket(this.maxPacketLength).initialize(this.cid, packetSequence, continuationPacketBuff).serialize());
            packetSequence++;
        }
    }
    async recv(): Promise<Payload> {
        if (this.status === 'unavailable') await this.init();
        let initPacket = new CtapHidInitPacket(this.maxPacketLength);
        let continuationPacket = new CtapHidContinuationPacket(this.maxPacketLength);

        initPacket.deserialize(Buffer.from(this.deviceHandle.readTimeout(30000)));

        // TODO: fix me. CtapHidErrorCmd may return invalid channel
        if (this.cid.compare(initPacket.cid) !== 0 && initPacket.cmd !== CtapHidErrorCmd) {
            throw new UsbInvalidChannelId();
        }

        let result = Buffer.alloc(initPacket.length);
        let packetSequence = 0;
        let offset = 0;

        offset += initPacket.data.copy(result, offset);

        while (offset < initPacket.length) {
            continuationPacket.deserialize(Buffer.from(this.deviceHandle.readTimeout(30000)));
            if (this.cid.compare(continuationPacket.cid) !== 0) { throw new UsbInvalidPacketSequence(); }
            if (packetSequence !== continuationPacket.sequence) { throw new UsbInvalidPacketSequence(); }
            offset += continuationPacket.data.copy(result, offset);
            packetSequence++;
        }
        return { cmd: initPacket.cmd, data: result };
    }
    close(): void {
        this.deviceHandle.close();
        // usb.release();
    }
}