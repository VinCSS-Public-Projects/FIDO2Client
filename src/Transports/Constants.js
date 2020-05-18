/**
 *
 * @type {{MSG: number, INIT: number, PING: number, WINK: number, CANCEL: number, LOCK: number, ERROR: number, CBOR: number, VENDOR_FIRST: number, KEEPALIVE: number}}
 */
module.exports.CTAP_HID = {
    PING: 0x1,
    MSG: 0x3,
    LOCK: 0x4,
    INIT: 0x6,
    WINK: 0x8,
    CBOR: 0x10,
    CANCEL: 0x11,
    ERROR: 0x3F,
    KEEPALIVE: 0xBB,
    VENDOR_FIRST: 0x40
};

/**
 *
 * @type {{WINK: number, NMSG: number, LOCK: number, CBOR: number}}
 */
module.exports.CAPABILITY = {
    WINK: 0x1,
    LOCK: 0x2,
    CBOR: 0x04,
    NMSG: 0x8,
};

/**
 *
 * @type {number}
 */
module.exports.TYPE_INT = 0x80;

/**
 *
 * @type {Buffer}
 */
module.exports.HID_BROADCAST_CID = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);

/**
 *
 * @type {Buffer}
 */
module.exports.ERR_CHANNEL_BUSY = Buffer.from([0x06]);