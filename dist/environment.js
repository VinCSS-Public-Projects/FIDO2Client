"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientPin = exports.Fido2Spec = exports.ClientPinVersion = exports.Fido2SpecVersion = void 0;
var Fido2SpecVersion;
(function (Fido2SpecVersion) {
    Fido2SpecVersion["v20"] = "FIDO_2_0";
    Fido2SpecVersion["v21p"] = "FIDO_2_1_PRE";
    Fido2SpecVersion["v21"] = "FIDO_2_1";
})(Fido2SpecVersion = exports.Fido2SpecVersion || (exports.Fido2SpecVersion = {}));
var ClientPinVersion;
(function (ClientPinVersion) {
    ClientPinVersion[ClientPinVersion["v1"] = 1] = "v1";
    ClientPinVersion[ClientPinVersion["v2"] = 2] = "v2";
})(ClientPinVersion = exports.ClientPinVersion || (exports.ClientPinVersion = {}));
exports.Fido2Spec = Fido2SpecVersion.v21;
exports.ClientPin = [ClientPinVersion.v1];
