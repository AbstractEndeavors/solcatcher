import type { AddressLike, IntLike, BoolLike } from './imports.js';
export interface GetAccountInfoConfig {
    encoding?: 'jsonParsed' | 'base64';
    commitment?: 'processed' | 'confirmed' | 'finalized';
}
export interface TokenMintInfo {
    decimals: IntLike;
    freezeAuthority?: AddressLike;
    isInitialized: BoolLike;
    mintAuthority?: AddressLike;
    supply: string;
}
export interface AccountInfoParsed {
    data: {
        parsed: {
            info: TokenMintInfo;
            type: 'mint';
        };
        program: string;
        space: IntLike;
    };
    executable: BoolLike;
    lamports: IntLike;
    owner: AddressLike;
    rentEpoch: IntLike;
}
export interface RpcAccountInfoResponse {
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
