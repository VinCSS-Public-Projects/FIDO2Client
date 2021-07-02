/**
 * See more
 * https://www.w3.org/TR/webauthn-2/#dictdef-authenticatorselectioncriteria
 */
export class WrapAuthenticatorSelectionCriteria {
    authenticatorAttachment!: "platform" | "cross-platform";
    residentKey!: "discouraged" | "preferred" | "required";
    requireResidentKey!: boolean;
    userVerification!: "discouraged" | "preferred" | "required";
}