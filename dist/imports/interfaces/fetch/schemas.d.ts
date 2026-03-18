import type { IdLike, MethodLike } from './imports.js';
export declare class RpcPayload {
    readonly jsonrpc: string;
    readonly id: IdLike;
    readonly method: MethodLike;
    readonly params: unknown[];
    constructor(jsonrpc: string, id: IdLike, method: MethodLike, params: unknown[]);
    toString(): string;
}
