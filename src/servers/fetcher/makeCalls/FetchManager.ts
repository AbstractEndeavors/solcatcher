
import { RpcCache,normalizeBase58,getPubkey,getSignature,getPubkeyString,inflightRegistry } from './imports/index.js';
import type {AddressLike,IntLike,DataLike,SigLike,LimitLike,MintLike,StringLike,IdLike,SolanaTransactionResponse,Commitment,SignatureDict } from './imports/index.js';
import {getFullTokenInfo} from './metaData/fetchMetaData.js'
import {urlToString,type FetchTxnParams} from '@imports';
import {RateLimiterService as RateLimiterDB} from '@repositories/ratelimiter/index.js'
export function unwrapRpcResult<T = unknown>(rpc: any): T {
  if (!rpc || typeof rpc !== "object") {
    throw new Error("RPC response is not an object");
  }

  if (!("result" in rpc)) {
    return rpc
  }

  return rpc.result as T;
}
export class FetchManager {
  private readonly limiter: RateLimiterDB;
  private readonly commitment: Commitment;
  private readonly cache: RpcCache;

  constructor(
    limiter: RateLimiterDB,
    commitment: Commitment = "processed",
    cacheMaxSize = 10_000
  ) {
    this.limiter = limiter;
    this.commitment = commitment;
    this.cache = new RpcCache(cacheMaxSize);
  }
  async getBalance(input: {
    account: AddressLike;
    commitment?: Commitment;
  }): Promise<any> {
    const { account, commitment = this.commitment } = input;
    if (!account) return null;
    const method = 'getBalance';
    const params = [getPubkeyString(account),{commitment}];
    return await this.fetchRpc({method,params});
  }

  async getAccountInfo(input: {
      account: AddressLike;
      commitment?: Commitment;
      encoding?: "base64" | "base58" | "jsonParsed";
      offset?: IntLike;
      length?: IntLike;
      dataSlice?: DataLike;
      }): Promise<any> {
      const {
          account,
          commitment = this.commitment,
          encoding = "base64",
          offset = 0,
          length = 0,
          dataSlice
      } = input;

      if (!account) return null;
      const method ="getAccountInfo"
      const pubkeyStr = getPubkeyString(account);
      const slice = dataSlice ?? { offset, length };
      const params =  [pubkeyStr, { commitment, encoding, ...slice }]
      return await this.fetchRpc({method,params});
  }
  async getAccountInfoJsonParsed(input: {
      account: AddressLike;
      commitment?: Commitment;
      encoding?: "base64" | "base58" | "jsonParsed";
      offset?: IntLike;
      length?: IntLike;
      dataSlice?: DataLike;
      }): Promise<any> {
      input.encoding="jsonParsed"
      return await this.getAccountInfo(input)
  }
  /**
  * Fetches signatures for a given address.
  *
  * @param account - The address to fetch signatures for.
  * @param until - Optional parameter to fetch signatures until a certain point.
  * @param limit - The maximum number of signatures to fetch.
  * @returns An array of signatures.
  */
  async getSignaturesForAddress(
    options:{
      account: AddressLike,
      until?: SigLike,
      limit?: LimitLike,
      commitment?: StringLike,
      
  },fallback:boolean=false): Promise<SignatureDict[]> {

    const limit = options.limit ?? 1000;
    const until = options.until ?? null;
    const commitment = options.commitment ?? null
    const method = "getSignaturesForAddress";
    const pubkeyStr = getPubkeyString(options.account);
    const params = [pubkeyStr,{ limit, until, commitment }];
    return await this.fetchRpc({ method, params},fallback);

  }
  async getTransaction(input: FetchTxnParams): Promise<SolanaTransactionResponse | null>  {
    const {
      signature,
      encoding = "base64", // ← FIX
      commitment = this.commitment,
      maxSupportedTransactionVersion = 0
    } = input;
    if (!signature) return null;
    const method = "getTransaction";
    const sig = getSignature(signature);
    const params = [sig,{ encoding, commitment, maxSupportedTransactionVersion}]
    return await this.fetchRpc({method,params});
  }
  async fetchMetaData(mint: MintLike): Promise<any> {
      const mintKey = getPubkeyString(mint);
      const cacheKey = `metadata:${mintKey}`;

      const cached = this.cache.get<any>(cacheKey);
      if (cached) return cached;

      const inflight = inflightRegistry.get(cacheKey);
      if (inflight) return inflight;

      const promise = getFullTokenInfo(mintKey);
      inflightRegistry.set(cacheKey, promise);

      try {
          const result = await promise;
          this.cache.set(cacheKey, result, "fetchMetaData", "finalized");
          return result;
      } finally {
          inflightRegistry.delete(cacheKey);
      }
  }
  // ─────────────────────────────────────────────
  // CORE RPC (with caching)
  // ─────────────────────────────────────────────
  async fetchRpc<T = any>(options: {
    method: string;
    params: unknown[];
    id?: string | number | undefined;
    jsonrpc?: string | number | undefined;
    headers?: Record<string, string> | undefined;
    commitment?: Commitment;
    context?: {
      pair_id?: IdLike;
      meta_id?: IdLike;
      mint?: string;
      signature?: string;
    }
  },fallback:boolean=false): Promise<T> {
    options.commitment = options.commitment || this.extractCommitment(options.params);
    const cacheKey = RpcCache.buildKey(options.method, options.params);

    // 1️⃣ Cache
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== null) return cached;

    // 2️⃣ Inflight dedupe
    const inflight = inflightRegistry.get(cacheKey);
    if (inflight) return inflight;

    // ✅ Validate rateLimiter before use
    if (!this.limiter) {
      throw new Error('FetchManager.fetchRpc: this.rateLimiter is undefined');
    }
    let promise:any=null

    // 3️⃣ Delegate execution to RateLimiterService
    promise = this.limiter.fetchRpc(options,fallback) as Promise<T>;

    inflightRegistry.set(cacheKey, promise);

    try {
      let result = await promise;

      if (result && result !== null) {
        this.cache.set(cacheKey, result, options.method, options.commitment);
        // ✅ FIXED: Check if result has .json() before calling
        if (typeof (result as any).json === 'function') {
          result = await (result as any).json();
        }
      }

      return unwrapRpcResult(result);
    } finally {
      inflightRegistry.delete(cacheKey);
    }
  }

  private extractCommitment(params: unknown[]): Commitment {
    if (!params || !Array.isArray(params)) return this.commitment;
    
    const last = params[params.length - 1];
    if (last && typeof last === "object" && !Array.isArray(last)) {
      const c = (last as any).commitment;
      if (c === "processed" || c === "confirmed" || c === "finalized") {
        return c;
      }
    }
    return this.commitment;
  }

  // ─────────────────────────────────────────────
  // URL HELPERS
  // ─────────────────────────────────────────────
  async getUrl(method: string | null = null): Promise<any> {
    let url = await this.limiter.getUrl(method ?? "default_method");
    
    if (!url){
      url = await this.getFallbackUrl()
    }
    return url;
  }



  async getFallbackUrl(): Promise<string> {
    return urlToString(await this.limiter.fallbackUrl);
  }

}

