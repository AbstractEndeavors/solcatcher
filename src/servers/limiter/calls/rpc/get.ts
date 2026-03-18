import {getFetchManager} from '@rateLimiter'
import type {FetchIntent,Commitment,IdLike,IntLike} from './../imports.js';
export async function fetchRpc(options: {
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
  }): Promise<any> {
  const limiter = await getFetchManager()
  const result = await limiter.fetchRpc(options);
  return result
}