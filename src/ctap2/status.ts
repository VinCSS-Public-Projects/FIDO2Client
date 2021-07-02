/**
 * See more
 * https://fidoalliance.org/specs/fido-v2.1-rd-20210309/#error-responses
 */
export enum CtapStatusCode {
    Ctap1ErrSuccess, Ctap2Ok = 0x00,//	Indicates successful response.
    Ctap1ErrInvalidCommand = 0x01,//	The command is not a valid CTAP command.
    Ctap1ErrInvalidParameter = 0x02,//	The command included an invalid parameter.
    Ctap1ErrInvalidLength = 0x03,//	Invalid message or item length.
    Ctap1ErrInvalidSeq = 0x04,//	Invalid message sequencing.
    Ctap1ErrTimeout = 0x05,//	Message timed out.
    Ctap1ErrChannelBusy = 0x06,//	Channel busy. Client SHOULD retry the request after a short delay. Note that the client may abort the transaction if the command is no longer relevant.
    Ctap1ErrLockRequired = 0x0A,//	Command requires channel lock.
    Ctap1ErrInvalidChannel = 0x0B,//	Command not allowed on this cid.
    Ctap2ErrCborUnexpectedType = 0x11,//	Invalid/unexpected CBOR error.
    Ctap2ErrInvalidCbor = 0x12,//	Error when parsing CBOR.
    Ctap2ErrMissingParameter = 0x14,//	Missing non-optional parameter.
    Ctap2ErrLimitExceeded = 0x15,//	Limit for number of items exceeded.
    Ctap2ErrFpDatabaseFull = 0x17,//	Fingerprint data base is full, e.g., during enrollment.
    Ctap2ErrLargeBlobStorageFull = 0x18,//	Large blob storage is full. (See § 6.10.3 Large, per-credential blobs.)
    Ctap2ErrCredentialExcluded = 0x19,//	Valid credential found in the exclude list.
    Ctap2ErrProcessing = 0x21,//	Processing (Lengthy operation is in progress).
    Ctap2ErrInvalidCredential = 0x22,//	Credential not valid for the authenticator.
    Ctap2ErrUserActionPending = 0x23,//	Authentication is waiting for user interaction.
    Ctap2ErrOperationPending = 0x24,//	Processing, lengthy operation is in progress.
    Ctap2ErrNoOperations = 0x25,//	No request is pending.
    Ctap2ErrUnsupportedAlgorithm = 0x26,//	Authenticator does not support requested algorithm.
    Ctap2ErrOperationDenied = 0x27,//	Not authorized for requested operation.
    Ctap2ErrKeyStoreFull = 0x28,//	Internal key storage is full.
    Ctap2ErrUnsupportedOption = 0x2B,//	Unsupported option.
    Ctap2ErrInvalidOption = 0x2C,//	Not a valid option for current operation.
    Ctap2ErrKeepaliveCancel = 0x2D,//	Pending keep alive was cancelled.
    Ctap2ErrNoCredentials = 0x2E,//	No valid credentials provided.
    Ctap2ErrUserActionTimeout = 0x2F,//	A user action timeout occurred.
    Ctap2ErrNotAllowed = 0x30,//	Continuation command, such as, authenticatorGetNextAssertion not allowed.
    Ctap2ErrPinInvalid = 0x31,//	PIN Invalid.
    Ctap2ErrPinBlocked = 0x32,//	PIN Blocked.
    Ctap2ErrPinAuthInvalid = 0x33,//	PIN authentication,pinUvAuthParam, verification failed.
    Ctap2ErrPinAuthBlocked = 0x34,//	PIN authentication using pinUvAuthToken blocked. Requires power cycle to reset.
    Ctap2ErrPinNotSet = 0x35,//	No PIN has been set.
    Ctap2ErrPuatRequired = 0x36,//	A pinUvAuthToken is required for the selected operation. See also the pinUvAuthToken option ID.
    Ctap2ErrPinPolicyViolation = 0x37,//	PIN policy violation. Currently only enforces minimum length.
    Reserved = 0x38,// for Future Use	Reserved for Future Use
    Ctap2ErrRequestTooLarge = 0x39,//	Authenticator cannot handle this request due to memory constraints.
    Ctap2ErrActionTimeout = 0x3A,//	The current operation has timed out.
    Ctap2ErrUpRequired = 0x3B,//	User presence is required for the requested operation.
    Ctap2ErrUvBlocked = 0x3C,//	built-in user verification is disabled.
    Ctap2ErrIntegrityFailure = 0x3D,//	A checksum did not match.
    Ctap2ErrInvalidSubcommand = 0x3E,//	The requested subcommand is either invalid or not implemented.
    Ctap2ErrUvInvalid = 0x3F,//	built-in user verification unsuccessful. The platform should retry.
    Ctap2ErrUnauthorizedPermission = 0x40,//	The permissions parameter contains an unauthorized permission.
    Ctap1ErrOther = 0x7F,//	Other unspecified error.
    Ctap2ErrSpecLast = 0xDF,//	CTAP 2 spec last error.
    Ctap2ErrExtensionFirst = 0xE0,//	Extension specific error.
    Ctap2ErrExtensionLast = 0xEF,//	Extension specific error.
    Ctap2ErrVendorFirst = 0xF0,//	Vendor specific error.
    Ctap2ErrVendorLast = 0xFF,//	Vendor specific error.
}