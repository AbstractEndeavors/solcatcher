import type { LimitLike, AddressLike, SigLike, StringLike, SignatureDict } from './../imports.js';
export declare function fetchSignaturesForAddress(options: {
    account: AddressLike;
    until?: SigLike;
    before?: SigLike;
    limit?: LimitLike;
    commitment?: StringLike;
}, fallback?: boolean): Promise<SignatureDict[]>;
