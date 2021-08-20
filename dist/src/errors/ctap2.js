"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctap2ErrInvalidSubcommand = exports.Ctap2ErrIntegrityFailure = exports.Ctap2ErrUvBlocked = exports.Ctap2ErrUpRequired = exports.Ctap2ErrActionTimeout = exports.Ctap2ErrRequestTooLarge = exports.Ctap2ErrReserved = exports.Ctap2ErrPinPolicyViolation = exports.Ctap2ErrPuatRequired = exports.Ctap2ErrPinNotSet = exports.Ctap2ErrPinAuthBlocked = exports.Ctap2ErrPinAuthInvalid = exports.Ctap2ErrPinBlocked = exports.Ctap2ErrPinInvalid = exports.Ctap2ErrNotAllowed = exports.Ctap2ErrUserActionTimeout = exports.Ctap2ErrNoCredentials = exports.Ctap2ErrKeepaliveCancel = exports.Ctap2ErrInvalidOption = exports.Ctap2ErrUnsupportedOption = exports.Ctap2ErrKeyStoreFull = exports.Ctap2ErrOperationDenied = exports.Ctap2ErrUnsupportedAlgorithm = exports.Ctap2ErrNoOperations = exports.Ctap2ErrOperationPending = exports.Ctap2ErrUserActionPending = exports.Ctap2ErrInvalidCredential = exports.Ctap2ErrProcessing = exports.Ctap2ErrCredentialExcluded = exports.Ctap2ErrLargeBlobStorageFull = exports.Ctap2ErrFpDatabaseFull = exports.Ctap2ErrLimitExceeded = exports.Ctap2ErrMissingParameter = exports.Ctap2ErrInvalidCbor = exports.Ctap2ErrCborUnexpectedType = exports.Ctap1ErrInvalidChannel = exports.Ctap1ErrLockRequired = exports.Ctap1ErrChannelBusy = exports.Ctap1ErrTimeout = exports.Ctap1ErrInvalidSeq = exports.Ctap1ErrInvalidLength = exports.Ctap1ErrInvalidParameter = exports.Ctap1ErrInvalidCommand = exports.Ctap2Ok = exports.Ctap1ErrSuccess = exports.Ctap2InvalidStatus = exports.Ctap2InvalidCommand = exports.Ctap2TransportUnsupported = exports.Ctap2PingDataMissmatch = exports.Ctap2ClientPinVersionUnsupported = void 0;
exports.Ctap2ErrVendorLast = exports.Ctap2ErrVendorFirst = exports.Ctap2ErrExtensionLast = exports.Ctap2ErrExtensionFirst = exports.Ctap2ErrSpecLast = exports.Ctap1ErrOther = exports.Ctap2ErrUnauthorizedPermission = exports.Ctap2ErrUvInvalid = void 0;
class Ctap2ClientPinVersionUnsupported extends Error {
}
exports.Ctap2ClientPinVersionUnsupported = Ctap2ClientPinVersionUnsupported;
class Ctap2PingDataMissmatch extends Error {
}
exports.Ctap2PingDataMissmatch = Ctap2PingDataMissmatch;
class Ctap2TransportUnsupported extends Error {
}
exports.Ctap2TransportUnsupported = Ctap2TransportUnsupported;
class Ctap2InvalidCommand extends Error {
}
exports.Ctap2InvalidCommand = Ctap2InvalidCommand;
class Ctap2InvalidStatus extends Error {
}
exports.Ctap2InvalidStatus = Ctap2InvalidStatus;
class Ctap1ErrSuccess extends Error {
}
exports.Ctap1ErrSuccess = Ctap1ErrSuccess;
class Ctap2Ok extends Error {
}
exports.Ctap2Ok = Ctap2Ok;
class Ctap1ErrInvalidCommand extends Error {
}
exports.Ctap1ErrInvalidCommand = Ctap1ErrInvalidCommand;
class Ctap1ErrInvalidParameter extends Error {
}
exports.Ctap1ErrInvalidParameter = Ctap1ErrInvalidParameter;
class Ctap1ErrInvalidLength extends Error {
}
exports.Ctap1ErrInvalidLength = Ctap1ErrInvalidLength;
class Ctap1ErrInvalidSeq extends Error {
}
exports.Ctap1ErrInvalidSeq = Ctap1ErrInvalidSeq;
class Ctap1ErrTimeout extends Error {
}
exports.Ctap1ErrTimeout = Ctap1ErrTimeout;
class Ctap1ErrChannelBusy extends Error {
}
exports.Ctap1ErrChannelBusy = Ctap1ErrChannelBusy;
class Ctap1ErrLockRequired extends Error {
}
exports.Ctap1ErrLockRequired = Ctap1ErrLockRequired;
class Ctap1ErrInvalidChannel extends Error {
}
exports.Ctap1ErrInvalidChannel = Ctap1ErrInvalidChannel;
class Ctap2ErrCborUnexpectedType extends Error {
}
exports.Ctap2ErrCborUnexpectedType = Ctap2ErrCborUnexpectedType;
class Ctap2ErrInvalidCbor extends Error {
}
exports.Ctap2ErrInvalidCbor = Ctap2ErrInvalidCbor;
class Ctap2ErrMissingParameter extends Error {
}
exports.Ctap2ErrMissingParameter = Ctap2ErrMissingParameter;
class Ctap2ErrLimitExceeded extends Error {
}
exports.Ctap2ErrLimitExceeded = Ctap2ErrLimitExceeded;
class Ctap2ErrFpDatabaseFull extends Error {
}
exports.Ctap2ErrFpDatabaseFull = Ctap2ErrFpDatabaseFull;
class Ctap2ErrLargeBlobStorageFull extends Error {
}
exports.Ctap2ErrLargeBlobStorageFull = Ctap2ErrLargeBlobStorageFull;
class Ctap2ErrCredentialExcluded extends Error {
}
exports.Ctap2ErrCredentialExcluded = Ctap2ErrCredentialExcluded;
class Ctap2ErrProcessing extends Error {
}
exports.Ctap2ErrProcessing = Ctap2ErrProcessing;
class Ctap2ErrInvalidCredential extends Error {
}
exports.Ctap2ErrInvalidCredential = Ctap2ErrInvalidCredential;
class Ctap2ErrUserActionPending extends Error {
}
exports.Ctap2ErrUserActionPending = Ctap2ErrUserActionPending;
class Ctap2ErrOperationPending extends Error {
}
exports.Ctap2ErrOperationPending = Ctap2ErrOperationPending;
class Ctap2ErrNoOperations extends Error {
}
exports.Ctap2ErrNoOperations = Ctap2ErrNoOperations;
class Ctap2ErrUnsupportedAlgorithm extends Error {
}
exports.Ctap2ErrUnsupportedAlgorithm = Ctap2ErrUnsupportedAlgorithm;
class Ctap2ErrOperationDenied extends Error {
}
exports.Ctap2ErrOperationDenied = Ctap2ErrOperationDenied;
class Ctap2ErrKeyStoreFull extends Error {
}
exports.Ctap2ErrKeyStoreFull = Ctap2ErrKeyStoreFull;
class Ctap2ErrUnsupportedOption extends Error {
}
exports.Ctap2ErrUnsupportedOption = Ctap2ErrUnsupportedOption;
class Ctap2ErrInvalidOption extends Error {
}
exports.Ctap2ErrInvalidOption = Ctap2ErrInvalidOption;
class Ctap2ErrKeepaliveCancel extends Error {
}
exports.Ctap2ErrKeepaliveCancel = Ctap2ErrKeepaliveCancel;
class Ctap2ErrNoCredentials extends Error {
}
exports.Ctap2ErrNoCredentials = Ctap2ErrNoCredentials;
class Ctap2ErrUserActionTimeout extends Error {
}
exports.Ctap2ErrUserActionTimeout = Ctap2ErrUserActionTimeout;
class Ctap2ErrNotAllowed extends Error {
}
exports.Ctap2ErrNotAllowed = Ctap2ErrNotAllowed;
class Ctap2ErrPinInvalid extends Error {
}
exports.Ctap2ErrPinInvalid = Ctap2ErrPinInvalid;
class Ctap2ErrPinBlocked extends Error {
}
exports.Ctap2ErrPinBlocked = Ctap2ErrPinBlocked;
class Ctap2ErrPinAuthInvalid extends Error {
}
exports.Ctap2ErrPinAuthInvalid = Ctap2ErrPinAuthInvalid;
class Ctap2ErrPinAuthBlocked extends Error {
}
exports.Ctap2ErrPinAuthBlocked = Ctap2ErrPinAuthBlocked;
class Ctap2ErrPinNotSet extends Error {
}
exports.Ctap2ErrPinNotSet = Ctap2ErrPinNotSet;
class Ctap2ErrPuatRequired extends Error {
}
exports.Ctap2ErrPuatRequired = Ctap2ErrPuatRequired;
class Ctap2ErrPinPolicyViolation extends Error {
}
exports.Ctap2ErrPinPolicyViolation = Ctap2ErrPinPolicyViolation;
class Ctap2ErrReserved extends Error {
}
exports.Ctap2ErrReserved = Ctap2ErrReserved;
class Ctap2ErrRequestTooLarge extends Error {
}
exports.Ctap2ErrRequestTooLarge = Ctap2ErrRequestTooLarge;
class Ctap2ErrActionTimeout extends Error {
}
exports.Ctap2ErrActionTimeout = Ctap2ErrActionTimeout;
class Ctap2ErrUpRequired extends Error {
}
exports.Ctap2ErrUpRequired = Ctap2ErrUpRequired;
class Ctap2ErrUvBlocked extends Error {
}
exports.Ctap2ErrUvBlocked = Ctap2ErrUvBlocked;
class Ctap2ErrIntegrityFailure extends Error {
}
exports.Ctap2ErrIntegrityFailure = Ctap2ErrIntegrityFailure;
class Ctap2ErrInvalidSubcommand extends Error {
}
exports.Ctap2ErrInvalidSubcommand = Ctap2ErrInvalidSubcommand;
class Ctap2ErrUvInvalid extends Error {
}
exports.Ctap2ErrUvInvalid = Ctap2ErrUvInvalid;
class Ctap2ErrUnauthorizedPermission extends Error {
}
exports.Ctap2ErrUnauthorizedPermission = Ctap2ErrUnauthorizedPermission;
class Ctap1ErrOther extends Error {
}
exports.Ctap1ErrOther = Ctap1ErrOther;
class Ctap2ErrSpecLast extends Error {
}
exports.Ctap2ErrSpecLast = Ctap2ErrSpecLast;
class Ctap2ErrExtensionFirst extends Error {
}
exports.Ctap2ErrExtensionFirst = Ctap2ErrExtensionFirst;
class Ctap2ErrExtensionLast extends Error {
}
exports.Ctap2ErrExtensionLast = Ctap2ErrExtensionLast;
class Ctap2ErrVendorFirst extends Error {
}
exports.Ctap2ErrVendorFirst = Ctap2ErrVendorFirst;
class Ctap2ErrVendorLast extends Error {
}
exports.Ctap2ErrVendorLast = Ctap2ErrVendorLast;
//# sourceMappingURL=ctap2.js.map