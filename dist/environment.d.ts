export declare enum Fido2SpecVersion {
    UNKNOWN = -1,
    FIDO_2_0 = 0,
    FIDO_2_1_PRE = 1,
    FIDO_2_1 = 2
}
/**
 * Return latest version.
 * @param versions
 */
export declare function getLatestSpecVersion(versions: string[]): Fido2SpecVersion;
export declare enum ClientPinVersion {
    v1 = 1,
    v2 = 2
}
export declare const Fido2Spec: Fido2SpecVersion;
export declare const ClientPin: ClientPinVersion[];
