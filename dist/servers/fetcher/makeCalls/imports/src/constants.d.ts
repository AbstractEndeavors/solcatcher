import type { IdLike, MethodLike } from './../src/index.js';
export type FetchIntent = 'authoritative' | 'enrichment' | 'repair';
export type Commitment = "processed" | "confirmed" | "finalized";
export declare const inflightRegistry: Map<string, Promise<any>>;
export declare const DEFAULT_COMMITMENT = "confirmed";
export declare class RpcPayload {
    readonly jsonrpc: string;
    readonly id: IdLike;
    readonly method: MethodLike;
    readonly params: unknown[];
    constructor(jsonrpc: string, id: IdLike, method: MethodLike, params: unknown[]);
    toString(): string;
}
