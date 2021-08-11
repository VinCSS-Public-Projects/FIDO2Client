import { NfcFragmentTooLarge } from "../../errors/nfc";

export enum InstructionClass {
    Command = 0x80,
    Chaining = 0x90
}

export enum InstructionCode {
    Select = 0xa4,
    NfcCtapMsg = 0x10,
    NfcCtapPing = 0x1,
    NfcCtapGetResponse = 0x11,
    NfcCtapUnknown = 0xc0,
    NfcCtapControl = 0x12
}

export class Fragment {
    cla!: InstructionClass;
    ins!: InstructionCode;
    p1!: number;
    p2!: number;
    lc!: number;
    data?: Buffer;
    le!: number;

    initialize(cla: InstructionClass, ins: InstructionCode, p1: number, p2: number, data?: Buffer, le?: number): this {
        if (data && data.length > 0xffff) throw new NfcFragmentTooLarge();
        this.cla = cla;
        this.ins = ins;
        this.p1 = p1;
        this.p2 = p2;
        this.lc = data ? data.length : 0;
        this.data = data;
        this.le = le || 0x80;
        return this;
    }

    serialize(): Buffer {
        let size = this.lc + 4 + (this.lc ? 1 : 0) + (this.le ? 1 : 0);
        let fragment = Buffer.alloc(size);
        let offset = 0;
        offset = fragment.writeUInt8(this.cla, offset);
        offset = fragment.writeUInt8(this.ins, offset);
        offset = fragment.writeUInt8(this.p1, offset);
        offset = fragment.writeUInt8(this.p2, offset);
        if (this.lc !== 0 && this.data) {
            offset = fragment.writeUInt8(this.lc, offset);
            offset += this.data.copy(fragment, offset, 0);
        }
        offset = fragment.writeUInt8(this.le, offset);
        return fragment;
    }

    deserialize(payload: Buffer): this {
        return this;
    }
}