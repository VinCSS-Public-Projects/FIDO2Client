import { ClientPinVersion } from "../../environment";
import { ClientPinV1 } from "../ctap2/client-pin";
import { Ctap2Cli } from "../ctap2/ctap2";
import { Fido2DeviceCli } from "../fido2/fido2-device-cli";
import { Fido2ClientErrPinUvAuthProtocolUnsupported } from "../errors/client";
import { CollectedClientData } from "../webauthn/WrapCollectedClientData";
import { logger } from "../log/debug";

export class Ctap2Session {
    device: Fido2DeviceCli;
    ctap2: Ctap2Cli;
    clientData!: CollectedClientData;
    clientDataHash!: Buffer;
    timeout!: NodeJS.Timeout;

    constructor(pinUvAuthProtocol: ClientPinVersion) {
        this.device = new Fido2DeviceCli();
        switch (pinUvAuthProtocol) {
            case ClientPinVersion.v1:
                this.ctap2 = new Ctap2Cli(this.device, new ClientPinV1());
                break;
            default:
                throw new Fido2ClientErrPinUvAuthProtocolUnsupported();
        }

    }

    revoke(): void {
        clearTimeout(this.timeout);
        this.device.close();
    }
}