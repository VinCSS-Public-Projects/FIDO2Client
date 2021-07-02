import { decodeAllSync, decodeFirstSync } from "cbor";
import { Ctap2ErrInvalidCbor } from "../errors/ctap2";

interface IFlags {
    up: boolean;
    rfu1: boolean;
    uv: boolean;
    rfu2: number;
    at: boolean;
    ed: boolean;
}

interface IAttestedCredentialData {
    aaguid: Buffer;
    credentialIdLength: number;
    credentialId: Buffer;
    credentialPublicKey: Map<number, any>;
}

export class AuthenticatorData {
    rpIdHash: Buffer;
    flags: IFlags;
    signCount: number;
    attestedCredentialData: IAttestedCredentialData | undefined;
    extensions: any = {};

    constructor(buff: Buffer) {
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
        }
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

            let map: any[];
            try {
                map = decodeAllSync(buff.slice(offset));
            } catch (e) {
                throw new Ctap2ErrInvalidCbor();
            }

            this.attestedCredentialData = {
                aaguid: aaguid,
                credentialIdLength: credentialIdLength,
                credentialId: credentialId,
                credentialPublicKey: map[0]
            }
            if (this.flags.ed) { this.extensions = map[1] }
            return;
        }
        if (this.flags.ed) {
            try {
                this.extensions = decodeFirstSync(buff.slice(offset));
            } catch (e) {
                throw new Ctap2ErrInvalidCbor();
            }
        }

    }
}