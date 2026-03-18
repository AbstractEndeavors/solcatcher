import type { UrlDict } from './../imports.js';
import type { FetchUnsortedLimitParams, Commitment, RpcPayloadParams } from './../types.js';
import { RpcPayload } from './../schemas.js';
export declare function normalizeFetchUnsortedLimitInput(a?: unknown, b?: unknown): FetchUnsortedLimitParams;
export declare function extractCommitment(params: unknown[]): Commitment;
export declare function toUrlString(url: UrlDict | string): string;
export declare function createRpcPayload(input: RpcPayloadParams): RpcPayload;
