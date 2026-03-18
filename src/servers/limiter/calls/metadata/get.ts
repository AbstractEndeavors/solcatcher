import {getFetchManager} from '@rateLimiter'
import type {MintLike} from './../imports.js';
export async function fetchMetaData(mint: MintLike): Promise<any> {
  const limiter = await getFetchManager()
  const result = await limiter.fetchMetaData(mint);
  return result
}