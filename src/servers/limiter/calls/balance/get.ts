import {getFetchManager} from '@rateLimiter'
import type {Commitment,AddressLike} from './../imports.js';
export async function fetchBalance(options: {
  account: AddressLike;
  commitment?: Commitment;
}): Promise<any> {
  const limiter = await getFetchManager()
  const result = await limiter.getBalance(options)
  return result
}