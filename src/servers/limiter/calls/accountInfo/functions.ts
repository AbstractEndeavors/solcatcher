import {getPubkey,normalizeBase58} from './../imports.js';
import type { FetchManager } from '@FetchUtils/makeCalls/FetchManager.js';
import type {Encoding,DataLike,Commitment,IntLike,AddressLike,IdLike,FetchIntent} from './../imports.js';
export interface AccountInfoParams {
    account: AddressLike,
    maxSupportedTransactionVersion?:IntLike,
    offset?: IntLike;
    length?: IntLike;
    dataSlice?: DataLike;
    encoding?: Encoding, 
    commitment?: Commitment,
    method?:string,
    params?:any
    
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
export function getAccountInfoBody(
  body: AccountInfoParams
): RpcPayload | null {
  const {
    account,
    commitment = "finalized",
    encoding = "base64",
    maxSupportedTransactionVersion = 0,
    offset = 0,
    length = 0,
    dataSlice
  } = body;

  if (!account) return null;

  const pubkeyStr = normalizeBase58(getPubkey(account));
  const slice = dataSlice ?? { offset, length };

  return {
    method: "getAccountInfo",
    params: [
      pubkeyStr,
      {
        encoding,
        commitment,
        maxSupportedTransactionVersion,
        ...slice
      }
    ]
  };
}
export function getResult<T = any>(res: any): T | null {
  if (res == null) return null;
  if (typeof res === "object" && "result" in res) return res.result;
  if (typeof res === "object" && "value" in res) return res.value;
  return res;
}

/**
 * Fetches signatures for a given address.
 *
 * @param account - The address to fetch signatures for.
 * @param until - Optional parameter to fetch signatures until a certain point.
 * @param limit - The maximum number of signatures to fetch.
 * @returns An array of signatures.
 */
export async function FetchAccountInfo(
  fm: FetchManager,
  options: AccountInfoParams
) {
  const body = getAccountInfoBody(options);
  if (!body) return null;

  const res = await fm.fetchRpc(body);
  const final = getResult(res);
  return final
}
