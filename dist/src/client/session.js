"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2Session = void 0;
const environment_1 = require("../../environment");
const client_pin_1 = require("../ctap2/client-pin");
const ctap2_1 = require("../ctap2/ctap2");
const fido2_device_cli_1 = require("../fido2/fido2-device-cli");
const client_1 = require("../errors/client");
class Ctap2Session {
    constructor(pinUvAuthProtocol) {
        this.device = new fido2_device_cli_1.Fido2DeviceCli();
        switch (pinUvAuthProtocol) {
            case environment_1.ClientPinVersion.v1:
                this.ctap2 = new ctap2_1.Ctap2Cli(this.device, new client_pin_1.ClientPinV1());
                break;
            default:
                throw new client_1.Fido2ClientErrPinUvAuthProtocolUnsupported();
        }
    }
    revoke() {
        clearTimeout(this.timeout);
        this.device.close();
    }
}
exports.Ctap2Session = Ctap2Session;
//# sourceMappingURL=session.js.map