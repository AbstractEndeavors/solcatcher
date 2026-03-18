import type { Commitment, UrlDict, MethodLike, IntLike } from './../src/index.js';
import { RpcPayload } from './../src/index.js';
export declare function extractCommitment(params: unknown[]): Commitment;
export declare function toUrlString(url: UrlDict | string): string;
export declare function createRpcPayload(method: MethodLike, params?: unknown[], id?: IntLike, jsonrpc?: IntLike): RpcPayload;
