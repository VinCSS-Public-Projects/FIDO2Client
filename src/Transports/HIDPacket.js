class InitPacket {

    /**
     *
     * @param packetSize
     * @param cid
     * @param cmd
     * @param totalSize
     * @param payload
     */
    constructor(packetSize, cid, cmd, totalSize, payload) {
        if ((cid.length !== 4) || (cmd > 255) || (totalSize >= 65536)) {
            throw Error('Invalid init packet')
        }
        this.packetSize = packetSize;
        this.cid = cid;
        this.cmd = cmd;
        this.totalSize = totalSize;
        this.payload = payload;
    }

    /**
     *
     * @param packetSize {number}
     * @param data {Buffer}
     * @returns {InitPacket}
     */
    static fromBytes = (packetSize, data) => {
        if (packetSize !== data.length) {
            throw Error('Invalid packet')
        }
        let cid = data.slice(0, 4);
        let cmd = data[4];
        let size = data.readUInt16BE(5);
        let payload = data.slice(7, 7 + size);
        return new InitPacket(packetSize, cid, cmd, size, payload);
    };

    /**
     *
     * @returns {Buffer}
     */
    toBytes = () => {
        let result = Buffer.alloc(this.packetSize);
        this.cid.copy(result);
        result.writeUInt8(this.cmd, this.cid.length);
        result.writeUInt16BE(this.totalSize, this.cid.length + 1);
        this.payload.copy(result, this.cid.length + 1 + 2);
        return result;
    }
}

class ContPacket {

    /**
     *
     * @param cid
     * @param packetSize
     * @param seq
     * @param payload
     */
    constructor(cid, packetSize, seq, payload) {
        if (payload.length > packetSize - 5) {
            throw Error('Invalid packet')
        }
        this.cid = cid;
        this.packSize = packetSize;
        this.seq = seq;
        this.payload = payload;
        if (this.seq === 128) {
            this.seq = 0;
        }
    }

    /**
     *
     * @param packetSize {number}
     * @param data {Buffer}
     * @returns {ContPacket}
     */
    static fromBytes = (packetSize, data) => {
        if (packetSize !== data.length) {
            throw Error('Invalid packet')
        }
        let cid = data.slice(0, 4);
        let seq = data[4];
        let payload = data.slice(5);
        return new ContPacket(cid, packetSize, seq, payload);
    };

    /**
     *
     * @returns {Buffer}
     */
    toBytes = () => {
        let result = Buffer.alloc(this.packSize);
        this.cid.copy(result);
        result.writeUInt8(this.seq, this.cid.length);
        this.payload.copy(result, this.cid.length + 1);
        return result;
    }
}

/**
 *
 * @type {InitPacket}
 */
module.exports.InitPacket = InitPacket;

/**
 *
 * @type {ContPacket}
 */
module.exports.ContPacket = ContPacket;