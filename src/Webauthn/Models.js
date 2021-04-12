const CryptoUtils = require('../Utils/CryptoUtils');
let base64url = require('base64url');
let { PublicKeyCredentialType, TokenBindingStatus } = require('./Contants');

/**
 * Relying Party Parameters for Credential Generation.
 * https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrpentity
 */
class PublicKeyCredentialRpEntity {

    /**
     *
     * @param id {string}
     * @param name {string}
     * @param icon {string}
     */
    constructor(id, name, icon) {

        this.id = id;
        this.name = name;
        this.icon = icon;
    }

    /**
     *
     * @param rp
     * @returns {PublicKeyCredentialRpEntity}
     */
    static fromJson(rp) {
        return new PublicKeyCredentialRpEntity(rp.id, rp.name, rp.icon);
    }

    /**
     *
     * @returns {Buffer}
     */
    rpIdHash() {
        return CryptoUtils.SHA256(this.id);
    }

    /**
     *
     * @returns {Map<any, any>}
     */
    toMap() {
        let result = new Map();
        result.set('id', this.id);
        if (this.name !== undefined) {
            result.set('name', this.name);
        }
        if (this.icon !== undefined) {
            result.set('icon', this.icon);
        }
        return result;
    }
}

/**
 * User Account Parameters for Credential Generation.
 * https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity
 */
class PublicKeyCredentialUserEntity {

    /**
     *
     * @param id {Buffer}
     * @param name {string}
     * @param displayName {string}
     * @param icon {string}
     */
    constructor(id, name, displayName, icon) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.icon = icon || 'default';
    }

    /**
     *
     * @param user
     * @returns {PublicKeyCredentialUserEntity}
     */
    static fromJson(user) {
        return new PublicKeyCredentialUserEntity(user.id, user.name, user.displayName, user.icon);
    }

    /**
     *
     * @returns {Map<any, any>}
     */
    toMap() {
        let result = new Map();
        result.set('id', this.id);
        result.set('name', this.name);
        result.set('displayName', this.displayName);
        if (this.icon) result.set('icon', this.icon);
        return result;
    }
}

/**
 * Parameters for Credential Generation.
 * https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialparameters
 */
class PublicKeyCredentialParameters {

    /**
     *
     * @param type {string}
     * @param alg {number}
     */
    constructor(type, alg) {

        this.type = type;
        this.alg = alg;
    }

    /**
     *
     * @param param
     * @returns {PublicKeyCredentialParameters}
     */
    static fromJson(param) {

        return new PublicKeyCredentialParameters(param.type, param.alg);
    }

    /**
     *
     * @returns {Map<any, any>}
     */
    toMap() {
        let result = new Map();
        result.set('type', this.type);
        result.set('alg', this.alg);
        return result;
    }
}

/**
 * Credential Descriptor.
 * https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor
 */
class PublicKeyCredentialDescriptor {

    /**
     *
     * @param type {string}
     * @param id {Buffer}
     * @param transports {string}
     */
    constructor(type, id, transports) {
        this.type = type;
        this.id = id;
        this.transports = transports;
    }

    /**
     *
     * @param descriptor
     * @returns {PublicKeyCredentialDescriptor}
     */
    static fromJson(descriptor) {
        return new PublicKeyCredentialDescriptor(descriptor['type'], descriptor['id'], descriptor['transports']);
    }

    /**
     *
     * @returns {Map<any, any>}
     */
    toMap() {
        let result = new Map();
        result.set('type', this.type);
        result.set('id', this.id);
        result.set('transports', this.transports);
        return result;
    }
}

/**
 * Authenticator Selection Criteria.
 * https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria
 */
class AuthenticatorSelectionCriteria {

    /**
     *
     * @param authenticatorAttachment {string}
     * @param requireResidentKey {boolean}
     * @param userVerification {string}
     */
    constructor(authenticatorAttachment, requireResidentKey, userVerification) {

        this.authenticatorAttachment = authenticatorAttachment;
        /**
         *
         * @type {boolean}
         */
        this.requireResidentKey = requireResidentKey;
        /**
         *
         * @type {string}
         */
        this.userVerification = userVerification;
    }

    static fromJson(selection) {
        return new AuthenticatorSelectionCriteria(selection.authenticatorAttachment, selection.requireResidentKey, selection.userVerification);
    }
}

/**
 * Options for Credential Creation.
 * https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions
 */
class PublicKeyCredentialCreationOptions {

    /**
     *
     * @param options
     */
    constructor(options) {

        /**
         * @type {Buffer}
         */
        this.challenge = options.challenge instanceof Uint8Array || options.challenge instanceof ArrayBuffer ?
            base64url.encode(options.challenge) : options.challenge;
        /**
         *
         * @type {PublicKeyCredentialRpEntity}
         */
        this.rp = PublicKeyCredentialRpEntity.fromJson(options.rp);
        /**
         *
         * @type {PublicKeyCredentialUserEntity}
         */
        this.user = PublicKeyCredentialUserEntity.fromJson(options.user);
        /**
         * @type {Array<PublicKeyCredentialParameters>}
         */
        this.credParams = options.pubKeyCredParams instanceof Array ? options.pubKeyCredParams.flatMap(param => PublicKeyCredentialParameters.fromJson(param)) : [];
        /**
         * @type {number}
         */
        this.timeout = isNaN(options.timeout) ? 6000 : options.timeout;
        /**
         * @type {Array}
         */
        this.excludeList = options.excludeCredentials instanceof Array ? options.excludeCredentials.flatMap(descriptor => PublicKeyCredentialDescriptor.fromJson(descriptor)) : [];
        /**
         * @type {AuthenticatorSelectionCriteria}
         */
        this.authenticatorSelection = options.authenticatorSelection ? AuthenticatorSelectionCriteria.fromJson(options.authenticatorSelection) : undefined;
        /**
         * @type {string}
         */
        this.attestation = typeof options.attestation === 'string' ? options.attestation : 'none';

        this.extensions = options.extensions;
        // Object.keys(options.extensions).forEach((x) => {
        //     switch (x) {
        //         case 'hmacCreateSecret':
        //             if (typeof options.extensions.hmacCreateSecret !== 'boolean') {
        //                 throw new Error('hmacCreateSecret invalid type');
        //             }
        //             Object.assign(this.extensions, { 'hmac-secret': options.extensions.hmacCreateSecret });
        //             break;
        //     }
        // });
    }
}

/**
 * Options for Assertion Generation.
 * https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrequestoptions
 */
class PublicKeyCredentialRequestOptions {

    /**
     *
     * @param options
     */
    constructor(options) {

        /**
         * @type {Buffer}
         */
        this.challenge = options.challenge instanceof Uint8Array || options.challenge instanceof ArrayBuffer ?
            base64url.encode(options.challenge) : options.challenge;
        /**
         * @type {number}
         */
        this.timeout = isNaN(options.timeout) ? 6000 : options.timeout;
        /**
         *
         */
        this.rpId = options.rpId;
        /**
         * @type {Array<PublicKeyCredentialDescriptor>}
         */
        this.allowList = options.allowCredentials instanceof Array ? options.allowCredentials.flatMap((descriptor) => PublicKeyCredentialDescriptor.fromJson(descriptor)) : [];
        /**
         * @type {string}
         */
        this.options = new Map([
            ['up', true],
            ['uv', options.userVerification !== 'discouraged' || false]
        ])
        // this.options = typeof options.userVerification === 'string' ? options.userVerification : 'preferred';

        this.extensions = options.extensions;
    }
}

/**
 * PublicKeyCredential Interface.
 * https://www.w3.org/TR/webauthn/#publickeycredential
 */
class PublicKeyCredential {

    /**
     *
     * @param id {Buffer}
     */
    constructor(id) {

        /**
         *
         * @type {Uint8Array}
         */
        this.rawId = new Uint8Array(id);
        /**
         *
         * @type {string}
         */
        this.id = base64url.encode(this.rawId);
        /**
         *
         * @type {string}
         */
        this.type = PublicKeyCredentialType.PUBLIC_KEY;
    }
}

/**
 * Information About Public Key Credential.
 * https://www.w3.org/TR/webauthn/#iface-authenticatorattestationresponse
 */
class AuthenticatorAttestationResponse {

    /**
     *
     * @param clientDataJson {string}
     * @param attestation {Attestation}
     */
    constructor(clientDataJson, attestation) {

        /**
         *
         * @type {Uint8Array}
         */
        this.clientDataJSON = new Uint8Array(Buffer.from(clientDataJson));
        /**
         *
         * @type {Uint8Array}
         */
        this.attestationObject = new Uint8Array(attestation.toCBOR());
    }
}

/**
 *
 */
class PublicKeyCredentialAttestation extends PublicKeyCredential {

    /**
     *
     * @param clientDataJson {string}
     * @param attestation {Attestation}
     */
    constructor(clientDataJson, attestation) {

        super(attestation.getCredID());
        this.response = new AuthenticatorAttestationResponse(clientDataJson, attestation);
        this.clientExtensionResults = attestation.getClientExtensionResults();
    }
}

/**
 * Web Authentication Assertion.
 * https://www.w3.org/TR/webauthn/#authenticatorassertionresponse
 */
class AuthenticatorAssertionResponse {

    /**
     *
     * @param clientDataJson {string}
     * @param assertion {Assertion}
     */
    constructor(clientDataJson, assertion) {

        this.clientDataJSON = new Uint8Array(Buffer.from(clientDataJson));
        this.authenticatorData = new Uint8Array(assertion.authData);
        this.signature = new Uint8Array(assertion.signature);
    }
}

/**
 *
 */
class PublicKeyCredentialAssertion extends PublicKeyCredential {

    /**
     *
     * @param clientDataJson {string}
     * @param assertion {Assertion}
     */
    constructor(clientDataJson, assertion) {

        super(assertion.credential.id);
        this.response = new AuthenticatorAssertionResponse(clientDataJson, assertion);
        if (assertion.user) this.response.userHandle = new Uint8Array(assertion.user.id);
        this.clientExtensionResults = assertion.getClientExtensionResults();
    }
}

class TokenBinding {

    /**
     *
     * @param status {string}
     * @param id {string}
     */
    constructor(status, id) {
        /**
         *
         * @type {string}
         */
        this.status = status;
        /**
         *
         * @type {string}
         */
        this.id = id;
    }
}

/**
 * Client Data Used in WebAuthn Signatures.
 * https://www.w3.org/TR/webauthn/#dictdef-collectedclientdata
 */
class CollectedClientData {

    /**
     *
     * @param type {string}
     * @param origin {string}
     * @param challenge {string}
     */
    constructor(type, origin, challenge) {

        /**
         *
         * @type {string}
         */
        this.type = type;
        /**
         *
         * @type {string}
         */
        this.origin = origin;
        /**
         *
         * @type {string}
         */
        this.challenge = challenge;
        /**
         *
         * @type {TokenBinding}
         */
        this.tokenBinding = new TokenBinding(TokenBindingStatus.PRESENT, '');
    }

    toJson() {
        return JSON.stringify({
            type: this.type,
            challenge: this.challenge instanceof Uint8Array ? base64url.encode(this.challenge) : this.challenge,
            origin: this.origin
        });
    }
}

/**
 *
 * @type {AuthenticatorSelectionCriteria}
 */
module.exports.AuthenticatorSelectionCriteria = AuthenticatorSelectionCriteria;

/**
 *
 * @type {PublicKeyCredentialCreationOptions}
 */
module.exports.PublicKeyCredentialCreationOptions = PublicKeyCredentialCreationOptions;

/**
 *
 * @type {PublicKeyCredentialRequestOptions}
 */
module.exports.PublicKeyCredentialRequestOptions = PublicKeyCredentialRequestOptions;

/**
 *
 * @type {PublicKeyCredentialAttestation}
 */
module.exports.PublicKeyCredentialAttestation = PublicKeyCredentialAttestation;

/**
 *
 * @type {PublicKeyCredentialAssertion}
 */
module.exports.PublicKeyCredentialAssertion = PublicKeyCredentialAssertion;

/**
 *
 * @type {CollectedClientData}
 */
module.exports.CollectedClientData = CollectedClientData;