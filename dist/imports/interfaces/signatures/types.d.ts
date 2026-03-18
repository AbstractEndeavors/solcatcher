import type { SigLike, LimitLike, AddressLike, IntLike, BoolLike, StringLike, DatabaseClient } from './imports.js';
export interface GetSignaturesDataConfig {
    until?: SigLike;
    limit?: LimitLike;
}
export interface AddressInfo {
    decimals: IntLike;
    freezeAuthority?: AddressLike;
    isInitialized: BoolLike;
    mintAuthority?: AddressLike;
    supply: IntLike;
}
export interface SignaturesDataParsed {
    data: {
        parsed: {
            info: AddressInfo;
            type: 'mint';
        };
        program: AddressLike;
        space: IntLike;
    };
    executable: BoolLike;
    lamports: IntLike;
    owner: AddressLike;
    rentEpoch: IntLike;
}
export interface RpcSignaturesDataResponse {
    context: {
        slot: IntLike;
    };
    value: {
        data: any;
        executable: BoolLike;
        lamports: IntLike;
        owner: AddressLike;
        rentEpoch: IntLike;
        space: IntLike;
    } | null;
}
export interface SignatureInfo {
    decimals: IntLike;
    freezeAuthority?: AddressLike;
    isInitialized: BoolLike;
    mintAuthority?: AddressLike;
    supply: IntLike;
}
export interface SignatureDict {
    signature: string;
    slot: number;
    err: string | null;
    memo: string | null;
    blockTime: number;
    confirmationStatus: string;
}
export interface SignatureDict {
    signature: string;
    slot: number;
    err: string | null;
    memo: string | null;
    blockTime: number;
    confirmationStatus: string;
}
export interface DiscoverIncremental {
    until: SigLike;
    fetched: number;
    complete: boolean;
}
export interface SignaturesParams {
    account: AddressLike;
    until?: SigLike;
    before?: SigLike;
    limit?: number | null;
    commitment?: StringLike;
    maxAttempts?: number | null;
    isIncomplete?: boolean;
}
export declare function get_sigs_result(res: any): any;
export interface SignaturesServiceConfig {
    db: DatabaseClient;
}
export interface SignatureDicts {
    obj?: any;
    signatures?: any;
    signaturesDicts?: any;
    signaturesDict?: any;
    signatureDicts?: any;
    signatureDict?: any;
}
export interface SignatureFilter extends SignatureDicts {
    err?: boolean;
    confirmationStatus?: string;
}
