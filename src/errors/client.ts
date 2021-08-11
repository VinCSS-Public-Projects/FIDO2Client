export class Fido2ClientErrDeviceNotFound extends Error { }
export class Fido2ClientErrPinUvAuthProtocolUnsupported extends Error { }
export class Fido2ClientErrUvNotConfigured extends Error { }
export class Fido2ClientErrPinNotConfigured extends Error { }
export class Fido2ClientErrUserVerificationNotCapable extends Error { }
export class Fido2ClientErrUserVerificationFailed extends Error { }
export class Fido2ClientErrMissingParameter extends Error { constructor(name: string) { super(`required member ${name} is undefined.`); } }
export class Fido2ClientErrInvalidParameter extends Error { constructor(name: string) { super(`type of member ${name} is invalid.`); } }
export class Fido2ClientErrExtensionNotImplemented extends Error { }
export class Fido2ClientErrMissingEventListener extends Error { constructor(name: string | undefined) { super(`required listener ${name} is unregistered.`); } }
export class Fido2ClientErrNotAllowed extends Error { }
export class Fido2ClientErrRelyPartyNotAllowed extends Error { }
export class Fido2ClientErrMethodDeprecated extends Error { }
export class Fido2ClientErrCancel extends Error { }
export class Fido2ClientErrTimeout extends Error { }
export class Fido2ClientErrNoCredentials extends Error { }
export class Fido2ClientErrUnknown extends Error { }
export class Fido2ClientErrPinAuthBlocked extends Error { }
export class Fido2ClientErrPinBlocked extends Error { }