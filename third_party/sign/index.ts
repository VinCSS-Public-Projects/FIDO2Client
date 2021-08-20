import bindings from 'bindings';

const sign = bindings('sign.node');

interface IVerifyResult {
    verified: boolean;
    signer: string;
}

export function verify(filepath: string): IVerifyResult {
    return sign.verify(filepath);
}