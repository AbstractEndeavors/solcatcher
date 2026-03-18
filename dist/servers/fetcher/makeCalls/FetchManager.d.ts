import type { AddressLike, IntLike, DataLike, SigLike, LimitLike, MintLike, StringLike, IdLike, SolanaTransactionResponse, Commitment, SignatureDict } from './imports/index.js';
import { type FetchTxnParams } from '@imports';
import { RateLimiterService as RateLimiterDB } from '@repositories/ratelimiter/index.js';
export declare function unwrapRpcResult<T = unknown>(rpc: any): T;
export declare class FetchManager {
    private readonly limiter;
    private readonly commitment;
    private readonly cache;
    constructor(limiter: RateLimiterDB, commitment?: Commitment, cacheMaxSize?: number);
    getBalance(input: {
        account: AddressLike;
        commitment?: Commitment;
    }): Promise<any>;
    getAccountInfo(input: {
        account: AddressLike;
        commitment?: Commitment;
        encoding?: "base64" | "base58" | "jsonParsed";
        offset?: IntLike;
        length?: IntLike;
        dataSlice?: DataLike;
    }): Promise<any>;
    getAccountInfoJsonParsed(input: {
        account: AddressLike;
        commitment?: Commitment;
        encoding?: "base64" | "base58" | "jsonParsed";
        offset?: IntLike;
        length?: IntLike;
        dataSlice?: DataLike;
    }): Promise<any>;
    /**
    * Fetches signatures for a given address.
    *
    * @param account - The address to fetch signatures for.
    * @param until - Optional parameter to fetch signatures until a certain point.
    * @param limit - The maximum number of signatures to fetch.
    * @returns An array of signatures.
    */
    getSignaturesForAddress(options: {
        account: AddressLike;
        until?: SigLike;
        limit?: LimitLike;
        commitment?: StringLike;
    }, fallback?: boolean): Promise<SignatureDict[]>;
    getTransaction(input: FetchTxnParams): Promise<SolanaTransactionResponse | null>;
    fetchMetaData(mint: MintLike): Promise<any>;
    fetchRpc<T = any>(options: {
        method: string;
        params: unknown[];
        id?: string | number | undefined;
        jsonrpc?: string | number | undefined;
        headers?: Record<string, string> | undefined;
        commitment?: Commitment;
        context?: {
            pair_id?: IdLike;
            meta_id?: IdLike;
            mint?: string;
            signature?: string;
        };
    }, fallback?: boolean): Promise<T>;
    private extractCommitment;
    getUrl(method?: string | null): Promise<any>;
    getFallbackUrl(): Promise<string>;
}
