"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fido2ClientErrPinBlocked = exports.Fido2ClientErrPinAuthBlocked = exports.Fido2ClientErrUnknown = exports.Fido2ClientErrNoCredentials = exports.Fido2ClientErrTimeout = exports.Fido2ClientErrCancel = exports.Fido2ClientErrMethodDeprecated = exports.Fido2ClientErrRelyPartyNotAllowed = exports.Fido2ClientErrNotAllowed = exports.Fido2ClientErrMissingEventListener = exports.Fido2ClientErrExtensionNotImplemented = exports.Fido2ClientErrInvalidParameter = exports.Fido2ClientErrMissingParameter = exports.Fido2ClientErrUserVerificationFailed = exports.Fido2ClientErrUserVerificationNotCapable = exports.Fido2ClientErrPinNotConfigured = exports.Fido2ClientErrUvNotConfigured = exports.Fido2ClientErrPinUvAuthProtocolUnsupported = exports.Fido2ClientErrDeviceNotFound = void 0;
class Fido2ClientErrDeviceNotFound extends Error {
}
exports.Fido2ClientErrDeviceNotFound = Fido2ClientErrDeviceNotFound;
class Fido2ClientErrPinUvAuthProtocolUnsupported extends Error {
}
exports.Fido2ClientErrPinUvAuthProtocolUnsupported = Fido2ClientErrPinUvAuthProtocolUnsupported;
class Fido2ClientErrUvNotConfigured extends Error {
}
exports.Fido2ClientErrUvNotConfigured = Fido2ClientErrUvNotConfigured;
class Fido2ClientErrPinNotConfigured extends Error {
}
exports.Fido2ClientErrPinNotConfigured = Fido2ClientErrPinNotConfigured;
class Fido2ClientErrUserVerificationNotCapable extends Error {
}
exports.Fido2ClientErrUserVerificationNotCapable = Fido2ClientErrUserVerificationNotCapable;
class Fido2ClientErrUserVerificationFailed extends Error {
}
exports.Fido2ClientErrUserVerificationFailed = Fido2ClientErrUserVerificationFailed;
class Fido2ClientErrMissingParameter extends Error {
    constructor(name) { super(`required member ${name} is undefined.`); }
}
exports.Fido2ClientErrMissingParameter = Fido2ClientErrMissingParameter;
class Fido2ClientErrInvalidParameter extends Error {
    constructor(name) { super(`type of member ${name} is invalid.`); }
}
exports.Fido2ClientErrInvalidParameter = Fido2ClientErrInvalidParameter;
class Fido2ClientErrExtensionNotImplemented extends Error {
}
exports.Fido2ClientErrExtensionNotImplemented = Fido2ClientErrExtensionNotImplemented;
class Fido2ClientErrMissingEventListener extends Error {
    constructor(name) { super(`required listener ${name} is unregistered.`); }
}
exports.Fido2ClientErrMissingEventListener = Fido2ClientErrMissingEventListener;
class Fido2ClientErrNotAllowed extends Error {
}
exports.Fido2ClientErrNotAllowed = Fido2ClientErrNotAllowed;
class Fido2ClientErrRelyPartyNotAllowed extends Error {
}
exports.Fido2ClientErrRelyPartyNotAllowed = Fido2ClientErrRelyPartyNotAllowed;
class Fido2ClientErrMethodDeprecated extends Error {
}
exports.Fido2ClientErrMethodDeprecated = Fido2ClientErrMethodDeprecated;
class Fido2ClientErrCancel extends Error {
}
exports.Fido2ClientErrCancel = Fido2ClientErrCancel;
class Fido2ClientErrTimeout extends Error {
}
exports.Fido2ClientErrTimeout = Fido2ClientErrTimeout;
class Fido2ClientErrNoCredentials extends Error {
}
exports.Fido2ClientErrNoCredentials = Fido2ClientErrNoCredentials;
class Fido2ClientErrUnknown extends Error {
}
exports.Fido2ClientErrUnknown = Fido2ClientErrUnknown;
class Fido2ClientErrPinAuthBlocked extends Error {
}
exports.Fido2ClientErrPinAuthBlocked = Fido2ClientErrPinAuthBlocked;
class Fido2ClientErrPinBlocked extends Error {
}
exports.Fido2ClientErrPinBlocked = Fido2ClientErrPinBlocked;
//# sourceMappingURL=client.js.map