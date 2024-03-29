"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtapStatusCode = void 0;
/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#error-responses
 */
var CtapStatusCode;
(function (CtapStatusCode) {
    CtapStatusCode[CtapStatusCode["Ctap1ErrSuccess"] = 0] = "Ctap1ErrSuccess";
    CtapStatusCode[CtapStatusCode["Ctap2Ok"] = 0] = "Ctap2Ok";
    CtapStatusCode[CtapStatusCode["Ctap1ErrInvalidCommand"] = 1] = "Ctap1ErrInvalidCommand";
    CtapStatusCode[CtapStatusCode["Ctap1ErrInvalidParameter"] = 2] = "Ctap1ErrInvalidParameter";
    CtapStatusCode[CtapStatusCode["Ctap1ErrInvalidLength"] = 3] = "Ctap1ErrInvalidLength";
    CtapStatusCode[CtapStatusCode["Ctap1ErrInvalidSeq"] = 4] = "Ctap1ErrInvalidSeq";
    CtapStatusCode[CtapStatusCode["Ctap1ErrTimeout"] = 5] = "Ctap1ErrTimeout";
    CtapStatusCode[CtapStatusCode["Ctap1ErrChannelBusy"] = 6] = "Ctap1ErrChannelBusy";
    CtapStatusCode[CtapStatusCode["Ctap1ErrLockRequired"] = 10] = "Ctap1ErrLockRequired";
    CtapStatusCode[CtapStatusCode["Ctap1ErrInvalidChannel"] = 11] = "Ctap1ErrInvalidChannel";
    CtapStatusCode[CtapStatusCode["Ctap2ErrCborUnexpectedType"] = 17] = "Ctap2ErrCborUnexpectedType";
    CtapStatusCode[CtapStatusCode["Ctap2ErrInvalidCbor"] = 18] = "Ctap2ErrInvalidCbor";
    CtapStatusCode[CtapStatusCode["Ctap2ErrMissingParameter"] = 20] = "Ctap2ErrMissingParameter";
    CtapStatusCode[CtapStatusCode["Ctap2ErrLimitExceeded"] = 21] = "Ctap2ErrLimitExceeded";
    CtapStatusCode[CtapStatusCode["Ctap2ErrFpDatabaseFull"] = 23] = "Ctap2ErrFpDatabaseFull";
    CtapStatusCode[CtapStatusCode["Ctap2ErrLargeBlobStorageFull"] = 24] = "Ctap2ErrLargeBlobStorageFull";
    CtapStatusCode[CtapStatusCode["Ctap2ErrCredentialExcluded"] = 25] = "Ctap2ErrCredentialExcluded";
    CtapStatusCode[CtapStatusCode["Ctap2ErrProcessing"] = 33] = "Ctap2ErrProcessing";
    CtapStatusCode[CtapStatusCode["Ctap2ErrInvalidCredential"] = 34] = "Ctap2ErrInvalidCredential";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUserActionPending"] = 35] = "Ctap2ErrUserActionPending";
    CtapStatusCode[CtapStatusCode["Ctap2ErrOperationPending"] = 36] = "Ctap2ErrOperationPending";
    CtapStatusCode[CtapStatusCode["Ctap2ErrNoOperations"] = 37] = "Ctap2ErrNoOperations";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUnsupportedAlgorithm"] = 38] = "Ctap2ErrUnsupportedAlgorithm";
    CtapStatusCode[CtapStatusCode["Ctap2ErrOperationDenied"] = 39] = "Ctap2ErrOperationDenied";
    CtapStatusCode[CtapStatusCode["Ctap2ErrKeyStoreFull"] = 40] = "Ctap2ErrKeyStoreFull";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUnsupportedOption"] = 43] = "Ctap2ErrUnsupportedOption";
    CtapStatusCode[CtapStatusCode["Ctap2ErrInvalidOption"] = 44] = "Ctap2ErrInvalidOption";
    CtapStatusCode[CtapStatusCode["Ctap2ErrKeepaliveCancel"] = 45] = "Ctap2ErrKeepaliveCancel";
    CtapStatusCode[CtapStatusCode["Ctap2ErrNoCredentials"] = 46] = "Ctap2ErrNoCredentials";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUserActionTimeout"] = 47] = "Ctap2ErrUserActionTimeout";
    CtapStatusCode[CtapStatusCode["Ctap2ErrNotAllowed"] = 48] = "Ctap2ErrNotAllowed";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPinInvalid"] = 49] = "Ctap2ErrPinInvalid";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPinBlocked"] = 50] = "Ctap2ErrPinBlocked";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPinAuthInvalid"] = 51] = "Ctap2ErrPinAuthInvalid";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPinAuthBlocked"] = 52] = "Ctap2ErrPinAuthBlocked";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPinNotSet"] = 53] = "Ctap2ErrPinNotSet";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPuatRequired"] = 54] = "Ctap2ErrPuatRequired";
    CtapStatusCode[CtapStatusCode["Ctap2ErrPinPolicyViolation"] = 55] = "Ctap2ErrPinPolicyViolation";
    CtapStatusCode[CtapStatusCode["Reserved"] = 56] = "Reserved";
    CtapStatusCode[CtapStatusCode["Ctap2ErrRequestTooLarge"] = 57] = "Ctap2ErrRequestTooLarge";
    CtapStatusCode[CtapStatusCode["Ctap2ErrActionTimeout"] = 58] = "Ctap2ErrActionTimeout";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUpRequired"] = 59] = "Ctap2ErrUpRequired";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUvBlocked"] = 60] = "Ctap2ErrUvBlocked";
    CtapStatusCode[CtapStatusCode["Ctap2ErrIntegrityFailure"] = 61] = "Ctap2ErrIntegrityFailure";
    CtapStatusCode[CtapStatusCode["Ctap2ErrInvalidSubcommand"] = 62] = "Ctap2ErrInvalidSubcommand";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUvInvalid"] = 63] = "Ctap2ErrUvInvalid";
    CtapStatusCode[CtapStatusCode["Ctap2ErrUnauthorizedPermission"] = 64] = "Ctap2ErrUnauthorizedPermission";
    CtapStatusCode[CtapStatusCode["Ctap1ErrOther"] = 127] = "Ctap1ErrOther";
    CtapStatusCode[CtapStatusCode["Ctap2ErrSpecLast"] = 223] = "Ctap2ErrSpecLast";
    CtapStatusCode[CtapStatusCode["Ctap2ErrExtensionFirst"] = 224] = "Ctap2ErrExtensionFirst";
    CtapStatusCode[CtapStatusCode["Ctap2ErrExtensionLast"] = 239] = "Ctap2ErrExtensionLast";
    CtapStatusCode[CtapStatusCode["Ctap2ErrVendorFirst"] = 240] = "Ctap2ErrVendorFirst";
    CtapStatusCode[CtapStatusCode["Ctap2ErrVendorLast"] = 255] = "Ctap2ErrVendorLast";
})(CtapStatusCode = exports.CtapStatusCode || (exports.CtapStatusCode = {}));
//# sourceMappingURL=status.js.map