let {NodeHID} = require('./HID/NodeHID');

let Promise = require('bluebird');
const hid = require('node-hid');
const utils = require('../Utils/CommonUtils');
const {HID_BROADCAST_CID, TYPE_INT, CTAP_HID} = require('./Constants');
const {ContPacket, InitPacket} = require('./HIDPacket');

class HIDDevice {

    /**
     *
     * @param vendorId {Number}
     * @param productId {Number}
     * @param path {String}
     * @param serialNumber {String}
     * @param manufacturer {String}
     * @param product {String}
     * @param release {Number}
     * @param usagePage {Number}
     * @param usage {Number}
     */
    constructor(vendorId, productId, path, serialNumber, manufacturer, product, release, usagePage, usage) {

        /**
         *
         * @type {Number}
         */
        this.vendorId = vendorId;
        /**
         *
         * @type {Number}
         */
        this.productId = productId;
        /**
         *
         * @type {String}
         */
        this.path = path;
        /**
         *
         * @type {String}
         */
        this.serialNumber = serialNumber;
        /**
         *
         * @type {String}
         */
        this.manufacturer = manufacturer;
        /**
         *
         * @type {String}
         */
        this.product = product;
        /**
         *
         * @type {Number}
         */
        this.release = release;
        /**
         *
         * @type {Number}
         */
        this.usagePage = usagePage;
        /**
         *
         * @type {Number}
         */
        this.usage = usage;
    }

}

class Device {

    /**
     *
     * @param device {HIDDevice}
     * @param maxPacketSize {Number}
     */
    constructor(device, maxPacketSize) {

        /**
         * Device handle
         * @type {HID}
         */
        this.deviceHandle = new hid.HID(device.path);
        /**
         * Max size per packet.
         * @type {Number}
         */
        this.maxPacketSize = maxPacketSize;
        /**
         * HID broadcast cid.
         * @type {Buffer}
         */
        this.cid = HID_BROADCAST_CID;
        /**
         * Total byte received.
         * @type {number}
         */
        this.totalRead = 0;
        /**
         * Sequence packet.
         * @type {number}
         */
        this.seq = 0;

        this.deviceHandle.on('error', (e) => {
            console.log(e);
        });
    }

    /**
     *
     * @returns {Promise<Device>}
     */
    initDevice = () => {
        let nonce = utils.RandomBytes(8);
        return this.exchange(TYPE_INT | CTAP_HID.INIT, nonce).then((responseData) => {
            if (responseData.length < 17) {
                throw Error('Unexpected reply len');
            }
            if (nonce.compare(responseData.slice(0, 8)) !== 0) {
                throw Error('Nonce mismatch')
            }
            this.cid = responseData.slice(8, 12);
            this.hidVersion = responseData[12];
            this.deviceVersion = responseData.slice(13, 16);
            this.capabilities = responseData[16];

            return this;
        });
    };

    /**
     *
     * @param cmd
     * @param payload
     * @returns {PromiseLike<any> | Promise<any>}
     */
    exchange = (cmd, payload) => {
        this.send(cmd, payload);
        return this.recv().then((payload) => {
            let respCmd = payload.cmd,
                respData = payload.payload;
            if (respCmd === CTAP_HID.ERROR) {
                if (ERR_CHANNEL_BUSY.compare(respData) === 0) {
                    throw Error('Device busy. Please try retry')
                }
            } else if (respCmd !== cmd) {
                throw Error('Command mismatch')
            }
            return respData;
        });
    };

    /**
     *
     * @param cmd {number}
     * @param payload {Buffer}
     */
    send = (cmd, payload) => {
        let firstFrame = payload.slice(0, this.maxPacketSize - 7);
        let currentPayloadOffset = this.maxPacketSize - 7;
        let firstPacket = new InitPacket(this.maxPacketSize, this.cid, cmd, payload.length, firstFrame);
        this.deviceHandle.write(Buffer.concat([Buffer.alloc(process.platform === 'win32' ? 1 : 0), firstPacket.toBytes()]));
        let seq = 0;
        while (currentPayloadOffset < payload.length) {
            let packetSize = this.maxPacketSize - 5;
            let nextFrame = payload.slice(currentPayloadOffset, currentPayloadOffset + packetSize);
            currentPayloadOffset += packetSize;
            let nextPacket = new ContPacket(this.cid, this.maxPacketSize, seq, nextFrame);
            this.deviceHandle.write(Buffer.concat([Buffer.alloc(process.platform === 'win32' ? 1 : 0), nextPacket.toBytes()]));
            seq += 1;
        }
    };

    /**
     *
     * @returns {Promise<{cmd: number, payload: Buffer}>}
     */
    recv = () => new Promise((resolve) => {
        /**
         * Handle first packet from device.
         * @param data {Buffer}
         */
        let callbackFirstPacket = (data) => {
            /**
             * Parse first packet.
             * @type {InitPacket}
             */
            let firstPacket = InitPacket.fromBytes(this.maxPacketSize, data);
            /**
             * Check channel id. Only receive data from current channel id.
             */
            if (this.cid.compare(firstPacket.cid) !== 0) {
                return;
            }
            this.deviceHandle.removeListener('data', callbackFirstPacket);
            resolve(firstPacket);
        };
        this.deviceHandle.on('data', callbackFirstPacket);
    }).then((firstPacket) => {

        let payload = Buffer.alloc(firstPacket.totalSize);
        firstPacket.payload.copy(payload);
        this.totalRead = firstPacket.payload.length;
        this.seq = 0;

        /**
         * Check if receive complete.
         */
        if (this.totalRead >= firstPacket.totalSize) {
            return {cmd: firstPacket.cmd, payload};
        }

        /**
         * Receive remain packet.
         */
        return new Promise((resolve, reject) => {

            /**
             * Handle remain packet.
             * @param data {Buffer}
             */
            let callbackNextPacket = (data) => {
                /**
                 * Parse next packet.
                 * @type {ContPacket}
                 */
                let nextPacket = ContPacket.fromBytes(this.maxPacketSize, data);

                /**
                 * Check channel id. Only receive data from current channel id.
                 */
                if (this.cid.compare(nextPacket.cid) !== 0) {
                    return;
                }

                /**
                 * Check packet sequence.
                 */
                if (this.seq !== nextPacket.seq) {
                    reject(new Error('Invalid sequence when receiving packet.'));
                    return;
                }

                /**
                 * Append next packet to main packet.
                 */
                nextPacket.payload.copy(payload, this.totalRead);
                this.totalRead += nextPacket.payload.length;
                this.seq += 1;

                /**
                 * Check if receive packet complete.
                 */
                if (this.totalRead >= firstPacket.totalSize) {
                    this.deviceHandle.removeListener('data', callbackNextPacket);
                    resolve({cmd: firstPacket.cmd, payload});
                }
            };
            this.deviceHandle.on('data', callbackNextPacket);
        });

    });
}

/**
 *
 * @returns {Array<HIDDevice>}
 * @constructor
 */
let GetFIDO2Devices = () => hid.devices().filter(device => ((device.usage & 1) && (device.usagePage === 0xF1D0))
    || NodeHID.IsFIDO2Device(device.path)).map(x => new HIDDevice(
    x.vendorId,
    x.productId,
    x.path,
    x.serialNumber,
    x.manufacturer,
    x.product,
    x.release,
    x.usagePage,
    x.usage
));

/**
 *
 * @type {Device}
 */
module.exports.Device = Device;

/**
 *
 * @type {HIDDevice}
 */
module.exports.HIDDevice = HIDDevice;

/**
 *
 * @type {function(): Array<HIDDevice>}
 */
module.exports.GetFIDO2Devices = GetFIDO2Devices;
