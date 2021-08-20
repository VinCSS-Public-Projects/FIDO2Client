"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatorData = void 0;
const cbor_1 = require("cbor");
const ctap2_1 = require("../errors/ctap2");
class AuthenticatorData {
    constructor(buff) {
        this.extensions = {};
        let offset = 0;
        this.rpIdHash = Buffer.alloc(32);
        offset += buff.copy(this.rpIdHash, 0, offset);
        let flags = buff.readUInt8(offset);
        this.flags = {
            up: !!((flags >> 0) & 1),
            rfu1: !!((flags >> 1) & 1),
            uv: !!((flags >> 2) & 1),
            rfu2: (flags >> 3) & 7,
            at: !!((flags >> 6) & 1),
            ed: !!((flags >> 7) & 1)
        };
        offset++;
        this.signCount = buff.readUInt32BE(offset);
        offset += 4;
        if (this.flags.at) {
            let aaguid = buff.slice(offset, offset + 16);
            offset += 16;
            let credentialIdLength = buff.readUInt16BE(offset);
            offset += 2;
            let credentialId = buff.slice(offset, offset + credentialIdLength);
            offset += credentialIdLength;
            let map;
            try {
                map = cbor_1.decodeAllSync(buff.slice(offset));
            }
            catch (e) {
                throw new ctap2_1.Ctap2ErrInvalidCbor();
            }
            this.attestedCredentialData = {
                aaguid: aaguid,
                credentialIdLength: credentialIdLength,
                credentialId: credentialId,
                credentialPublicKey: map[0]
            };
            if (this.flags.ed) {
                this.extensions = map[1];
            }
            return;
        }
        if (this.flags.ed) {
            try {
                this.extensions = cbor_1.decodeFirstSync(buff.slice(offset));
            }
            catch (e) {
                throw new ctap2_1.Ctap2ErrInvalidCbor();
            }
        }
    }
}
exports.AuthenticatorData = AuthenticatorData;
//# sourceMappingURL=make-credential.js.map