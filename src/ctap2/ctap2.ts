import { ClientPinVersion } from "../../environment";
import { Fido2Crypto } from "../crypto/crypto";
import { Fido2DeviceCli } from "../fido2/fido2-device-cli";
import { Ctap2ErrInvalidSubcommand } from "../errors/ctap2";
import { Payload } from "../transports/transport";
import { IClientPinCli, IPinUvAuthProtocol } from "./client-pin";
import { ClientPinSubCommand, Ctap2ClientPinReq, Ctap2ClientPinRes } from "./cmd/client-pin";
import { Ctap2GetAssertionReq, Ctap2GetAssertionRes, Fido2Assertion } from "./cmd/get-assertion";
import { Ctap2GetInfoReq, Ctap2GetInfoRes, Options } from "./cmd/get-info";
import { Ctap2GetNextAssertionReq } from "./cmd/get-next-assertion";
import { Fido2Credential, Ctap2MakeCredentialReq, Ctap2MakeCredentialRes } from "./cmd/make-credential";
import { IInfo, Info } from "./get-info";
import { Subject } from "rxjs";

export enum Ctap2Cmd {
    MakeCredential = 0x1,
    GetAssertion = 0x2,
    GetNextAssertion = 0x8,
    GetInfo = 0x4,
    ClientPIN = 0x6,
    Reset = 0x7,
    BioEnrollment = 0x9,
    Selection = 0x0b,
    LargeBlobs = 0x0c,
    Config = 0xd
}

export interface ICtap2Cmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}

interface MakeCredentialOptions {
    clientDataHash: Buffer;
    rp: PublicKeyCredentialRpEntity;
    user: PublicKeyCredentialUserEntity;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    excludeList?: PublicKeyCredentialDescriptor[];
    extensions?: Map<string, any>;
    options?: Options;
    pinUvAuthParam?: Buffer;
    pinUvAuthProtocol?: number;
    enterpriseAttestation?: number
}

interface GetCredentialOptions {
    rpId: string;
    clientDataHash: Buffer;
    allowList?: PublicKeyCredentialDescriptor[];
    extensions?: Map<string, any>;
    options?: Options;
    pinUvAuthParam?: Buffer;
    pinUvAuthProtocol?: number
}

interface ICtap2Cli {
    makeCredential(option: MakeCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Credential>;
    getAssertion(option: GetCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Assertion[]>;
    getNextAssertion(keepAlive?: Subject<number>): Promise<Fido2Assertion>;
    info: Promise<IInfo>;
    clientPin: IClientPinCli;
    reset(): void;
    bioEnrollment(): void;
    credentialManagement(): void;
    selection(): void;
    largeBlobs(): void;
    config(): void;
}

export class Ctap2Cli implements ICtap2Cli {
    constructor(
        private devcie: Fido2DeviceCli,
        private _clientPin: IPinUvAuthProtocol
    ) { }

    async makeCredential(option: MakeCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Credential> {
        let { clientDataHash, rp, user, pubKeyCredParams, excludeList, extensions, options, pinUvAuthParam, pinUvAuthProtocol, enterpriseAttestation } = option;
        let req = new Ctap2MakeCredentialReq().initialize(clientDataHash, rp, user, pubKeyCredParams, excludeList, extensions, options, pinUvAuthParam, pinUvAuthProtocol, enterpriseAttestation);
        let res = await (await this.devcie.console).cbor(req.serialize(), keepAlive);
        let credential = new Ctap2MakeCredentialRes().deserialize(res);
        return Object.assign({} as Fido2Credential, credential) as Fido2Credential;
    }

    async getAssertion(option: GetCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Assertion[]> {
        let { rpId, clientDataHash, allowList, extensions, options, pinUvAuthParam, pinUvAuthProtocol } = option;
        let req = new Ctap2GetAssertionReq().initialize(rpId, clientDataHash, allowList, extensions, options, pinUvAuthParam, pinUvAuthProtocol);
        let res = await (await this.devcie.console).cbor(req.serialize(), keepAlive);
        let credential = new Ctap2GetAssertionRes().deserialize(res);
        return [credential, ...await Promise.all(new Array((credential.numberOfCredentials && credential.numberOfCredentials > 1) ? credential.numberOfCredentials - 1 : 0).fill(true).map<Promise<Fido2Assertion>>(async x => await this.getNextAssertion(keepAlive)))];
    }

    async getNextAssertion(keepAlive?: Subject<number>): Promise<Fido2Assertion> {
        let req = new Ctap2GetNextAssertionReq().initialize();
        let res = await (await this.devcie.console).cbor(req.serialize(), keepAlive);
        let credential = new Ctap2GetAssertionRes().deserialize(res);
        return Object.assign({} as Fido2Assertion, credential) as Fido2Assertion;
    }
    get info(): Promise<IInfo> {
        return new Promise<IInfo>(async (resolve, reject) => {
            let req = new Ctap2GetInfoReq().initialize();
            let res = await (await this.devcie.console).cbor(req.serialize());
            let info = new Ctap2GetInfoRes().deserialize(res);
            resolve(Object.assign(new Info(), info));
        });
    }
    get clientPin(): IClientPinCli {
        return {
            getPinRetries: async () => {
                let req = new Ctap2ClientPinReq().initialize(this.clientPin.console.version, ClientPinSubCommand.getPinRetries);
                let cbor = await (await this.devcie.console).cbor(req.serialize());
                let res = new Ctap2ClientPinRes().deserialize(cbor);
                if (res.pinRetries === undefined) { throw new Ctap2ErrInvalidSubcommand() }
                return res.pinRetries;
            },
            getKeyAgreement: async () => {
                let req = new Ctap2ClientPinReq().initialize(ClientPinVersion.v1, ClientPinSubCommand.getKeyAgreement);
                let cbor = await (await this.devcie.console).cbor(req.serialize());
                let res = new Ctap2ClientPinRes().deserialize(cbor);
                if (res.keyAgreement === undefined) { throw new Ctap2ErrInvalidSubcommand() }
                return res.keyAgreement;
            },
            setPin: async (pin: string) => {
                // TODO: check pin policy
                let keyAgreement = await this.clientPin.getKeyAgreement();
                let newPin = Buffer.alloc(64); newPin.write(pin)
                let capsulate = this._clientPin.encapsulate(keyAgreement);
                let newPinEnc = this._clientPin.encrypt(capsulate.sharedSecret, newPin);
                let req = new Ctap2ClientPinReq().initialize(ClientPinVersion.v1, ClientPinSubCommand.setPin, capsulate.platformKeyAgreement, this._clientPin.authenticate(capsulate.sharedSecret, newPinEnc), newPinEnc);
                (await this.devcie.console).cbor(req.serialize());
            },
            changePin: async (curPinUnicode: string, newPinUnicode: string) => {
                // TODO: check pin policy
                let keyAgreement = await this.clientPin.getKeyAgreement();
                let curPin = Buffer.from(curPinUnicode);
                let newPin = Buffer.alloc(64); newPin.write(newPinUnicode);
                let capsulate = this._clientPin.encapsulate(keyAgreement);
                let pinHashEnc = this._clientPin.encrypt(capsulate.sharedSecret, Fido2Crypto.hash(curPin).slice(0, 16));
                let newPinEnc = this._clientPin.encrypt(capsulate.sharedSecret, newPin);
                let req = new Ctap2ClientPinReq().initialize(ClientPinVersion.v1, ClientPinSubCommand.changePin, capsulate.platformKeyAgreement, this._clientPin.authenticate(capsulate.sharedSecret, Buffer.concat([newPinEnc, pinHashEnc])), newPinEnc, pinHashEnc);
                (await this.devcie.console).cbor(req.serialize());
            },
            getPinToken: async (pinUnicode: string) => {
                // TODO: check pin policy
                let keyAgreement = await this.clientPin.getKeyAgreement();
                let pin = Buffer.from(pinUnicode);
                let capsulate = this._clientPin.encapsulate(keyAgreement);
                let req = new Ctap2ClientPinReq().initialize(ClientPinVersion.v1, ClientPinSubCommand.getPinToken, capsulate.platformKeyAgreement, undefined, undefined, this._clientPin.encrypt(capsulate.sharedSecret, Fido2Crypto.hash(pin).slice(0, 16)));
                let cbor = await (await this.devcie.console).cbor(req.serialize());
                let res = new Ctap2ClientPinRes().deserialize(cbor);
                if (res.pinUvAuthToken === undefined) { throw new Ctap2ErrInvalidSubcommand() }
                return this._clientPin.decrypt(this._clientPin.decapsulate(keyAgreement), res.pinUvAuthToken);
            },
            getPinUvAuthTokenUsingUvWithPermissions: () => {
                throw new Error("Method not implemented.");
            },
            getUVRetries: async () => {
                let req = new Ctap2ClientPinReq().initialize(this.clientPin.console.version, ClientPinSubCommand.getUVRetries);
                let cbor = await (await this.devcie.console).cbor(req.serialize());
                let res = new Ctap2ClientPinRes().deserialize(cbor);
                if (res.uvRetries === undefined) { throw new Ctap2ErrInvalidSubcommand() }
                return res.uvRetries;
            },
            getPinUvAuthTokenUsingPinWithPermissions: () => {
                throw new Error("Method not implemented.");
            },
            console: this._clientPin,
            version: this._clientPin.version
        }
    }
    reset(): void {
        throw new Error("Method not implemented.");
    }
    bioEnrollment(): void {
        throw new Error("Method not implemented.");
    }
    credentialManagement(): void {
        throw new Error("Method not implemented.");
    }
    selection(): void {
        throw new Error("Method not implemented.");
    }
    largeBlobs(): void {
        throw new Error("Method not implemented.");
    }
    config(): void {
        throw new Error("Method not implemented.");
    }
}