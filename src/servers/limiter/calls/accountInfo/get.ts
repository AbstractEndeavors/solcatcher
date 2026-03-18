import {getFetchManager} from '@rateLimiter'
import type {Encoding,Commitment,AddressLike,IntLike,DataLike} from './../imports.js';
export async function fetchAccountInfo(options:{
  account: AddressLike;
  commitment?: Commitment;
  encoding?: Encoding;
  offset?: IntLike;
  length?: IntLike;
  dataSlice?: DataLike;
}): Promise<any> {
  const limiter = await getFetchManager()
  const result = await limiter.getAccountInfo(options)
  return result
}


