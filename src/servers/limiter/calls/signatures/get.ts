import { getFetchManager } from '@rateLimiter';
import type { LimitLike, AddressLike, SigLike, StringLike,SignatureDict } from './../imports.js';

export async function fetchSignaturesForAddress(
  options: {
    account: AddressLike;
    until?: SigLike;
    before?: SigLike;
    limit?: LimitLike;
    commitment?: StringLike;
  },
  fallback:boolean=false
): Promise<SignatureDict[]> {
  const limiter = await getFetchManager()
  const result  = await limiter.getSignaturesForAddress(options,fallback);
  


  // ✅ PARSE STRING, NOT RESPONSE
  try {
    return result;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON (${options} bytes): ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
