/**
 *
 * @type {{NONE: string, DIRECT: string, INDIRECT: string}}
 */
module.exports.AttestationConveyancePreference = {
    NONE: 'none',
    INDIRECT: 'indirect',
    DIRECT: 'direct',
};

/**
 *
 * @type {{DISCOURAGED: string, PREFERRED: string, REQUIRED: string}}
 */
module.exports.UserVerificationRequirement = {
    REQUIRED: 'required',
    PREFERRED: 'preferred',
    DISCOURAGED: 'discouraged'
};

/**
 *
 * @type {{PLATFORM: string, CROSS_PLATFORM: string}}
 */
module.exports.AuthenticatorAttachment = {
    PLATFORM: 'platform',
    CROSS_PLATFORM: 'cross-platform'
};

/**
 *
 * @type {{USB: string, INTERNAL: string, NFC: string, BLE: string}}
 */
module.exports.AuthenticatorTransport = {
    USB: 'usb',
    NFC: 'nfc',
    BLE: 'ble',
    INTERNAL: 'internal',
};

/**
 *
 * @type {{PUBLIC_KEY: string}}
 */
module.exports.PublicKeyCredentialType = {
    PUBLIC_KEY: 'public-key'
};

module.exports.TokenBindingStatus = {
    PRESENT: 'present',
    SUPPORTED: 'supported'
};