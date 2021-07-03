/// <reference types="node" />
import { ClientPinVersion } from "../../environment";
import { Ctap2Cli } from "../ctap2/ctap2";
import { Fido2DeviceCli } from "../fido2/fido2-device-cli";
import { CollectedClientData } from "../webauthn/WrapCollectedClientData";
export declare class Ctap2Session {
    device: Fido2DeviceCli;
    ctap2: Ctap2Cli;
    clientData: CollectedClientData;
    clientDataHash: Buffer;
    timeout: NodeJS.Timeout;
    constructor(pinUvAuthProtocol: ClientPinVersion);
    revoke(): void;
}
