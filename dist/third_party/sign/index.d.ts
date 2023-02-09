interface IVerifyResult {
    verified: boolean;
    signer: string;
}
export declare function verify(filepath?: string): IVerifyResult;
export {};
