"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientPin = exports.Fido2Spec = exports.ClientPinVersion = exports.getLatestSpecVersion = exports.Fido2SpecVersion = void 0;
var Fido2SpecVersion;
(function (Fido2SpecVersion) {
    Fido2SpecVersion[Fido2SpecVersion["UNKNOWN"] = -1] = "UNKNOWN";
    Fido2SpecVersion[Fido2SpecVersion["FIDO_2_0"] = 0] = "FIDO_2_0";
    Fido2SpecVersion[Fido2SpecVersion["FIDO_2_1_PRE"] = 1] = "FIDO_2_1_PRE";
    Fido2SpecVersion[Fido2SpecVersion["FIDO_2_1"] = 2] = "FIDO_2_1";
})(Fido2SpecVersion = exports.Fido2SpecVersion || (exports.Fido2SpecVersion = {}));
/**
 * Return latest version.
 * @param versions
 */
function getLatestSpecVersion(versions) {
    let temp = Object.keys(Fido2SpecVersion).reverse();
    return temp.indexOf(temp.find(x => versions.includes(x)) || 'UNKNOWN');
}
exports.getLatestSpecVersion = getLatestSpecVersion;
var ClientPinVersion;
(function (ClientPinVersion) {
    ClientPinVersion[ClientPinVersion["v1"] = 1] = "v1";
    ClientPinVersion[ClientPinVersion["v2"] = 2] = "v2";
})(ClientPinVersion = exports.ClientPinVersion || (exports.ClientPinVersion = {}));
exports.Fido2Spec = Fido2SpecVersion.FIDO_2_1;
exports.ClientPin = [ClientPinVersion.v1];
//# sourceMappingURL=environment.js.map