"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2GetInfoRes = exports.Ctap2GetInfoReq = exports.Ctap2GetInfoCmd = void 0;
const cbor_1 = require("cbor");
const ctap2_1 = require("../../errors/ctap2");
exports.Ctap2GetInfoCmd = 0x4;
class Ctap2GetInfoReq {
    initialize(...args) {
        return this;
    }
    serialize() {
        return { cmd: exports.Ctap2GetInfoCmd, data: Buffer.alloc(0) };
    }
    deserialize(payload) {
        throw new Error("Method not implemented.");
    }
}
exports.Ctap2GetInfoReq = Ctap2GetInfoReq;
var Ctap2GetInfoName;
(function (Ctap2GetInfoName) {
    Ctap2GetInfoName[Ctap2GetInfoName["version"] = 1] = "version";
    Ctap2GetInfoName[Ctap2GetInfoName["extensions"] = 2] = "extensions";
    Ctap2GetInfoName[Ctap2GetInfoName["aaguid"] = 3] = "aaguid";
    Ctap2GetInfoName[Ctap2GetInfoName["options"] = 4] = "options";
    Ctap2GetInfoName[Ctap2GetInfoName["maxMsgSize"] = 5] = "maxMsgSize";
    Ctap2GetInfoName[Ctap2GetInfoName["pinUvAuthProtocols"] = 6] = "pinUvAuthProtocols";
    Ctap2GetInfoName[Ctap2GetInfoName["maxCredentialCountInList"] = 7] = "maxCredentialCountInList";
    Ctap2GetInfoName[Ctap2GetInfoName["maxCredentialIdLength"] = 8] = "maxCredentialIdLength";
    Ctap2GetInfoName[Ctap2GetInfoName["transports"] = 9] = "transports";
    Ctap2GetInfoName[Ctap2GetInfoName["algorithms"] = 10] = "algorithms";
    Ctap2GetInfoName[Ctap2GetInfoName["maxSerializedLargeBlobArray"] = 11] = "maxSerializedLargeBlobArray";
    Ctap2GetInfoName[Ctap2GetInfoName["forcePINChange"] = 12] = "forcePINChange";
    Ctap2GetInfoName[Ctap2GetInfoName["minPINLength"] = 13] = "minPINLength";
    Ctap2GetInfoName[Ctap2GetInfoName["firmwareVersion"] = 14] = "firmwareVersion";
    Ctap2GetInfoName[Ctap2GetInfoName["maxCredBlobLength"] = 15] = "maxCredBlobLength";
    Ctap2GetInfoName[Ctap2GetInfoName["maxRPIDsForSetMinPINLength"] = 16] = "maxRPIDsForSetMinPINLength";
    Ctap2GetInfoName[Ctap2GetInfoName["preferredPlatformUvAttempts"] = 17] = "preferredPlatformUvAttempts";
    Ctap2GetInfoName[Ctap2GetInfoName["uvModality"] = 18] = "uvModality";
    Ctap2GetInfoName[Ctap2GetInfoName["certifications"] = 19] = "certifications";
    Ctap2GetInfoName[Ctap2GetInfoName["remainingDiscoverableCredentials"] = 20] = "remainingDiscoverableCredentials";
    Ctap2GetInfoName[Ctap2GetInfoName["vendorPrototypeConfigCommands"] = 21] = "vendorPrototypeConfigCommands";
})(Ctap2GetInfoName || (Ctap2GetInfoName = {}));
class Ctap2GetInfoRes {
    initialize(...args) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    deserialize(payload) {
        let map;
        try {
            map = cbor_1.decodeFirstSync(payload);
        }
        catch (e) {
            throw new ctap2_1.Ctap2ErrInvalidCbor();
        }
        this.version = map.get(Ctap2GetInfoName.version);
        this.extensions = map.get(Ctap2GetInfoName.extensions);
        this.aaguid = map.get(Ctap2GetInfoName.aaguid);
        this.options = map.get(Ctap2GetInfoName.options);
        this.maxMsgSize = map.get(Ctap2GetInfoName.maxMsgSize);
        this.pinUvAuthProtocols = map.get(Ctap2GetInfoName.pinUvAuthProtocols);
        this.maxCredentialCountInList = map.get(Ctap2GetInfoName.maxCredentialCountInList);
        this.maxCredentialIdLength = map.get(Ctap2GetInfoName.maxCredentialIdLength);
        this.transports = map.get(Ctap2GetInfoName.transports);
        this.algorithms = map.get(Ctap2GetInfoName.algorithms);
        this.maxSerializedLargeBlobArray = map.get(Ctap2GetInfoName.maxSerializedLargeBlobArray);
        this.forcePINChange = map.get(Ctap2GetInfoName.forcePINChange);
        this.minPINLength = map.get(Ctap2GetInfoName.minPINLength);
        this.firmwareVersion = map.get(Ctap2GetInfoName.firmwareVersion);
        this.maxCredBlobLength = map.get(Ctap2GetInfoName.maxCredBlobLength);
        this.maxRPIDsForSetMinPINLength = map.get(Ctap2GetInfoName.maxRPIDsForSetMinPINLength);
        this.preferredPlatformUvAttempts = map.get(Ctap2GetInfoName.preferredPlatformUvAttempts);
        this.uvModality = map.get(Ctap2GetInfoName.uvModality);
        this.certifications = map.get(Ctap2GetInfoName.certifications);
        this.remainingDiscoverableCredentials = map.get(Ctap2GetInfoName.remainingDiscoverableCredentials);
        this.vendorPrototypeConfigCommands = map.get(Ctap2GetInfoName.vendorPrototypeConfigCommands);
        return this;
    }
}
exports.Ctap2GetInfoRes = Ctap2GetInfoRes;
//# sourceMappingURL=get-info.js.map