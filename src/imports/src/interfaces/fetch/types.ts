import type {MintLike,SigLike,LimitLike,AddressLike,IntLike,BoolLike,IdLike,StringLike,SignatureDict} from './imports.js';
import type {TimeRange} from './../time/index.js';
import {PaginationCursor} from './../cursor/index.js';
import type {SolanaTransactionResponse} from './../transactions/index.js'
export interface JsonRpcRequest<TParams = readonly unknown[]> {
  jsonrpc: '2.0';
  id: IdLike;
  method: string;
  params: TParams;
}

export interface JsonRpcSuccess<TResult> {
  jsonrpc: '2.0';
  id: IdLike;
  result: TResult;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcError {
  jsonrpc: '2.0';
  id?: IdLike;
  error: JsonRpcErrorObject;
}

export type JsonRpcResponse<TResult> =
  | JsonRpcSuccess<TResult>
  | JsonRpcError;
export interface RpcFetchOptions {
  url?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  useLimiter?: BoolLike;
}

export interface FetchUnsortedLimitParams {
  limit?: LimitLike;
  latest?: BoolLike;
}
export interface FetchUnsortedDiscriminatorParams extends FetchUnsortedLimitParams {
  discriminator?: StringLike;
  unprocessed?: BoolLike;
}

export interface FetchUnsortedPayloadParams extends FetchUnsortedDiscriminatorParams{
  id?: IdLike;
  signature?: SigLike;

}


// ============================================================
// QUERY PARAMS (Read: explicit filters)
// ============================================================

export class FetchByPairParams {
  constructor(
    public readonly pair_id: IdLike,
    public readonly limit?: LimitLike,
    public readonly cursor?: PaginationCursor
  ) {}
}

export class FetchByUserParams {
  constructor(
    public readonly user_address: AddressLike,
    public readonly limit: LimitLike = 100,
    public readonly cursor?: PaginationCursor
  ) {}
}

export class FetchByUserAndPairParams {
  constructor(
    public readonly user_address: string,
    public readonly pair_id: IdLike
  ) {}
}

export class FetchByCreatorParams {
  constructor(
    public readonly creator: AddressLike,
    public readonly limit: LimitLike = 100
  ) {}
}

export class FetchByTimeRangeParams {
  constructor(
    public readonly pair_id: IdLike,
    public readonly time_range: TimeRange
  ) {}
}

export class FetchByUserTimeRangeParams {
  constructor(
    public readonly user_address: AddressLike,
    public readonly time_range: TimeRange
  ) {}
}




export interface RpcContext {
    pair_id?: IdLike;
    meta_id?: IdLike;
    mint?: string;
    signature?: string;
}

export interface FetchOptions{
      url?:StringLike
      method?: StringLike,
      headers?: any,
      body?: any,
  };
export interface FetchParams {
      url:StringLike
      method?: StringLike,
      headers?: any,
      body?: any,
  };
export interface RpcPayloadParams {
  method: StringLike;
  params?: unknown[];
  id?: IntLike;
  jsonrpc?: IntLike;
}
export interface RpcParams extends RpcPayloadParams{
  headers?: Record<string, string>;
  commitment?: Commitment;
}
export interface RpcParamsIntent extends RpcParams{
  intent?: FetchIntent;
}
export interface RpcParamsContext extends RpcParamsIntent{
  context?: RpcContext;
}



export interface SignatureForAddressResult {
  context: {
    slot: number;
  };
  value: SignatureDict[];
}

export interface SignatureForAddress {
  jsonrpc: string;
  id: number;
  result: SignatureForAddressResult;
}


export type FetchIntent = 'authoritative' | 'enrichment' | 'repair';
export type Commitment = "processed" | "confirmed" | "finalized";
export type Encoding = "base64" | "base58" | "jsonParsed"
export interface FetchTxnParams {
      signature?: SigLike;
      encoding?: "json" | "jsonParsed" | "base64";
      commitment?: Commitment;
      maxSupportedTransactionVersion?: IntLike;
    }
export interface GetInsertDataParams extends FetchTxnParams{

    program_id?:AddressLike
}
export interface GetTxnResponseTranscription{
  signature: SigLike,
  response?: SolanaTransactionResponse,
  program_id?: AddressLike
}