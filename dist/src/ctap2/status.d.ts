/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#error-responses
 */
export declare enum CtapStatusCode {
    Ctap1ErrSuccess = 0,
    Ctap2Ok = 0,
    Ctap1ErrInvalidCommand = 1,
    Ctap1ErrInvalidParameter = 2,
    Ctap1ErrInvalidLength = 3,
    Ctap1ErrInvalidSeq = 4,
    Ctap1ErrTimeout = 5,
    Ctap1ErrChannelBusy = 6,
    Ctap1ErrLockRequired = 10,
    Ctap1ErrInvalidChannel = 11,
    Ctap2ErrCborUnexpectedType = 17,
    Ctap2ErrInvalidCbor = 18,
    Ctap2ErrMissingParameter = 20,
    Ctap2ErrLimitExceeded = 21,
    Ctap2ErrFpDatabaseFull = 23,
    Ctap2ErrLargeBlobStorageFull = 24,
    Ctap2ErrCredentialExcluded = 25,
    Ctap2ErrProcessing = 33,
    Ctap2ErrInvalidCredential = 34,
    Ctap2ErrUserActionPending = 35,
    Ctap2ErrOperationPending = 36,
    Ctap2ErrNoOperations = 37,
    Ctap2ErrUnsupportedAlgorithm = 38,
    Ctap2ErrOperationDenied = 39,
    Ctap2ErrKeyStoreFull = 40,
    Ctap2ErrUnsupportedOption = 43,
    Ctap2ErrInvalidOption = 44,
    Ctap2ErrKeepaliveCancel = 45,
    Ctap2ErrNoCredentials = 46,
    Ctap2ErrUserActionTimeout = 47,
    Ctap2ErrNotAllowed = 48,
    Ctap2ErrPinInvalid = 49,
    Ctap2ErrPinBlocked = 50,
    Ctap2ErrPinAuthInvalid = 51,
    Ctap2ErrPinAuthBlocked = 52,
    Ctap2ErrPinNotSet = 53,
    Ctap2ErrPuatRequired = 54,
    Ctap2ErrPinPolicyViolation = 55,
    Reserved = 56,
    Ctap2ErrRequestTooLarge = 57,
    Ctap2ErrActionTimeout = 58,
    Ctap2ErrUpRequired = 59,
    Ctap2ErrUvBlocked = 60,
    Ctap2ErrIntegrityFailure = 61,
    Ctap2ErrInvalidSubcommand = 62,
    Ctap2ErrUvInvalid = 63,
    Ctap2ErrUnauthorizedPermission = 64,
    Ctap1ErrOther = 127,
    Ctap2ErrSpecLast = 223,
    Ctap2ErrExtensionFirst = 224,
    Ctap2ErrExtensionLast = 239,
    Ctap2ErrVendorFirst = 240,
    Ctap2ErrVendorLast = 255
}
