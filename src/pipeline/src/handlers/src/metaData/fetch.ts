import {
  type OnchainMetadataPayload,
  type MetaDataEnrichParams,
  type OffchainFetchResult,
  type StringLike
} from '@imports';
import { fetchMetaData } from '@rateLimiter';
import { getMint } from './../utils/get.js';
import {type AllDeps} from '@db';

/* -------------------------------------------------- */
/* Fetch                                              */
/* -------------------------------------------------- */
export async function fetchOnchainMetaData(
  payload: MetaDataEnrichParams,
  deps: AllDeps
): Promise<OnchainMetadataPayload | null> {
  const mint = await getMint(payload,deps);
  if (!mint) return null;

  try {
    return await fetchMetaData(mint);
  } catch (err) {
    console.error({
      logType: 'error',
      message:  'metaEnrich: onchain fetch failed',
      details:  { mint, error: err instanceof Error ? err.message : String(err) },
    });
    return null;
  }
}


// ───────────────── Offchain JSON fetcher ─────────────────
export async function fetchOffchainJson(uri: StringLike): Promise<OffchainFetchResult | null> {
  if (!uri || uri.trim() === '') return null;
  // Handle IPFS
  let fetchUrl = uri;
  if (uri.startsWith('ipfs://')) {
    fetchUrl = `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}
