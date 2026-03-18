import {FetchManager, getFetchManager} from '@rateLimiter';
import type {AllDeps} from '@db';
import type {SolanaTransactionResponse,FetchTxnParams,RepoResult,LogDataInsertParams,GetInsertDataParams,FetchedTransaction} from '@imports';
import {transformSolanaTransaction} from '@imports';
export async function fetchTransactionRaw(options: FetchTxnParams,deps:AllDeps | null=null): Promise<SolanaTransactionResponse | null> {
  let limiter:FetchManager | null=null
  if (deps){
    limiter= deps.fetchManager
  }
  limiter = limiter || await getFetchManager()
  options.encoding= options.encoding || "base64"
  const result = await limiter.getTransaction(options)
  return result
}

export async function fetchTransaction(
  options: FetchTxnParams,
  deps:AllDeps | null=null
  
): Promise<RepoResult<FetchedTransaction>> {
  try {
    const limiter = await getFetchManager();
    options.encoding ??= 'base64';

    const tx = await fetchTransactionRaw(options,deps);
    if (!tx) {
      return {
        ok: false,
        reason: 'transaction_not_found',
        meta: { signature: options.signature },
      };
    }

    return {
      ok: true,
      value: {
        signature: options.signature,
        tx,
      },
    };
  } catch (err) {
    return {
      ok: false,
      reason: 'fetch_transaction_failed',
      meta: { err: String(err), signature: options.signature },
    };
  }
}

export async function fetchTxnInsertData(
  options: FetchTxnParams,
  deps:AllDeps | null=null
): Promise<RepoResult<LogDataInsertParams>> {
  const response = await fetchTransaction(options,deps);
  if (!response.ok) return response;
  return transformSolanaTransaction(response.value);
}