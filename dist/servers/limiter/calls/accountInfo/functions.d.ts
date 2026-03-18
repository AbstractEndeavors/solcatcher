import type { FetchManager } from '@FetchUtils/makeCalls/FetchManager.js';
import type { Encoding, DataLike, Commitment, IntLike, AddressLike, IdLike, FetchIntent } from './../imports.js';
export interface AccountInfoParams {
    account: AddressLike;
    maxSupportedTransactionVersion?: IntLike;
    offset?: IntLike;
    length?: IntLike;
    dataSlice?: DataLike;
    encoding?: Encoding;
    commitment?: Commitment;
    method?: string;
    params?: any;
}
export interface RpcPayload {
    method: string;
    params?: any;
    id?: IntLike;
    jsonrpc?: IntLike;
    headers?: Record<string, string>;
    intent?: FetchIntent;
    commitment?: Commitment;
    context?: {
        pair_id?: IdLike;
        meta_id?: IdLike;
        mint?: string;
        signature?: string;
    };
}
export declare function getAccountInfoBody(body: AccountInfoParams): RpcPayload | null;
export declare function getResult<T = any>(res: any): T | null;
/**
 * Fetches signatures for a given address.
 *
 * @param account - The address to fetch signatures for.
 * @param until - Optional parameter to fetch signatures until a certain point.
 * @param limit - The maximum number of signatures to fetch.
 * @returns An array of signatures.
 */
export declare function FetchAccountInfo(fm: FetchManager, options: AccountInfoParams): Promise<any>;
