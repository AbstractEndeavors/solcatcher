//import {startSolcatcher} from './src';
//await startSolcatcher()
import { getPubkey } from "@putkoff/abstract-solana";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, fetchDigitalAsset, fetchMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  AccountNotFoundError,
} from "@metaplex-foundation/umi";


import { getUrl, getFallbackUrl } from "./../../../limiter/client.js";
import type {MintLike} from '@imports'
const METADATA_RETRY_WINDOWS = [
  30_000,   // first retry after 30s
  120_000,  // then after 2m
  600_000,  // then after 10m
];
export function shouldAttemptMetadataFetch(row: {
  created_at: Date;
  updated_at: Date;
  has_metadata: boolean;
}): boolean {
  if (row.has_metadata) return false;

  const now = Date.now();
  const age = now - row.created_at.getTime();
  const sinceUpdate = now - row.updated_at.getTime();

  return METADATA_RETRY_WINDOWS.some(
    (window) => age >= window && sinceUpdate >= window
  );
}

/**
 * Registry for Umi instances
 * NO CONNECTION OBJECTS - uses only custom fetch
 */
export class UmiRegistry {
  async getUmi() {
    const method = "umi_init"
    const url = await getUrl(method);
    const umi = createUmi(url as any, {
      fetch: createRateLimitedFetch(),
    });
    umi.use(mplTokenMetadata());
    umi.use(
      signerIdentity(
        createSignerFromKeypair(umi, generateSigner(umi))
      )
    );
    return umi;
  }
}
export function sanitizeForJson(value: any): any {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(sanitizeForJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeForJson(v)])
    );
  }
  return value;
}
export function createRateLimitedFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = extractMethodFromRequest(init);
    const url = await getUrl(method);
    const res = await fetch(url as any, init);
    if (res.status === 429) {
      const fallbackUrl = await getFallbackUrl();
      const fallbackRes = await fetch(fallbackUrl, init);
      return fallbackRes;
    }

    return res;
  };
}
export function extractMethodFromRequest(init?: RequestInit): string {
  if (!init?.body) return "default";
  try {
    const body = JSON.parse(init.body as string);
    return body.method ?? "default";
  } catch {
    return "default";
  }
}
export async function getUmiMetadata(mint: MintLike) {
  const umiRegistry = new UmiRegistry()
  const umi = await umiRegistry.getUmi();
  return await fetchDigitalAsset(umi, getPubkey(mint as any) as any);
}
export async function getFullTokenInfo(mint: MintLike) {
  const umiRegistry = new UmiRegistry()
  const umi = await umiRegistry.getUmi();
  const raw = await fetchAllTokenInfo(umi, mint);

  return sanitizeForJson(raw); // ✔️ plain object
}
export async function getUmi(mint:MintLike):Promise<any>{
    const method = 'getUmi'
    const url = await getUrl(method)
    const umi = await createUmi(url as any);
    umi.use(mplTokenMetadata());
    const keypair = generateSigner(umi);
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));
    const metaData = await fetchDigitalAsset(umi, getPubkey(mint as any) as any);
    return metaData;
}
export async function fetchAllTokenInfo(
  umi: any,
  mint: MintLike
) {
  const mintPk = getPubkey(mint as any);
  /* ----------------------------
   * 2. Metaplex Metadata (OPTIONAL)
   * ---------------------------- */
  let metadataAccount: any = null;
  try {
    metadataAccount = await fetchMetadata(umi, mintPk as any);
  } catch (err: any) {
    if (!(err instanceof AccountNotFoundError)) {
      throw err; // real failure
    }
  }
  /* ----------------------------
   * 3. Off-chain JSON (OPTIONAL)
   * ---------------------------- */
  let offchain: any = null;
  if (metadataAccount?.uri) {
    try {
      const res = await fetch(metadataAccount.uri);
      if (res.ok) {
        offchain = await res.json();
      }
    } catch {
      /* ignore */
    }
  }
  return {
    mint,
    spl: mintPk,
    metadata: metadataAccount,
    offchain,
    hasMetadata: !!metadataAccount,
  };
}
