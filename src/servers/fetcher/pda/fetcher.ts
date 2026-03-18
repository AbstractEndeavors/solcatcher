// src/pipeline/pda/fetcher.ts

import { fetchRpc, fetchSignaturesForAddress, fetchTransaction,fetchAccountInfo } from '@rateLimiter';
import { BONDING_CURVE_DISCRIMINATOR, BONDING_CURVE_LAYOUT } from './constants.js';
import { BondingCurveDataResult } from './schemas.js';
import { type AddressLike,ensureString } from '@imports';
import bs58 from 'bs58';

// ═══════════════════════════════════════════════════════════
// SIGNATURE QUERIES
// ═══════════════════════════════════════════════════════════
function decodeAccountData(
  data: unknown
): Buffer | null {
  try {
    // Solana JSON-RPC standard form
    if (Array.isArray(data) && typeof data[0] === 'string') {
      return Buffer.from(data[0], 'base64');
    }

    // Some clients return raw base64
    if (typeof data === 'string') {
      return Buffer.from(data, 'base64');
    }

    // Already decoded (rare but happens)
    if (Buffer.isBuffer(data)) {
      return data;
    }

    return null;
  } catch {
    return null;
  }
}
export interface SignatureResult {
  signature: string;
  blockTime: number | null;
  slot: number;
  err: unknown | null;
}

/**
 * Fetch signatures for an address
 */
export async function fetchSignatures(
  account: AddressLike,
  limit: number = 1000,
  before?: string
): Promise<SignatureResult[]> {
  const res = await fetchSignaturesForAddress({account,limit, before, commitment: 'confirmed' })
  if (!res?.result) {
    return [];
  }

  return res.result.map((sig: any) => ({
    signature: sig.signature,
    blockTime: sig.blockTime ?? null,
    slot: sig.slot,
    err: sig.err ?? null,
  }));
}

/**
 * Find oldest signature by paginating backwards
 */
export async function findOldestSignature(
  address: AddressLike
): Promise<SignatureResult | null> {
  let before: string | undefined = undefined;
  let oldest: SignatureResult | null = null;

  while (true) {
    const signatures = await fetchSignatures(address, 1000, before);

    if (signatures.length === 0) {
      break;
    }

    oldest = signatures[signatures.length - 1];
    before = oldest.signature;

    if (signatures.length < 1000) {
      break;
    }
  }

  return oldest;
}

/**
 * Find first (most recent) signature
 */
export async function findFirstSignature(
  address: AddressLike
): Promise<SignatureResult | null> {
  const signatures = await fetchSignatures(address, 1);
  return signatures[0] ?? null;
}

// ═══════════════════════════════════════════════════════════
// TRANSACTION QUERIES
// ═══════════════════════════════════════════════════════════

/**
 * Get parsed transaction
 */
export async function fetchParsedTransaction(
  signature: string
): Promise<any | null> {
  const res = await fetchTransaction({signature,encoding: 'jsonParsed',commitment: 'confirmed'});

  return res ?? null;
}

/**
 * Get raw transaction (base64)
 */
export async function fetchRawTransaction(
  signature: string
): Promise<any | null> {
  const res = await fetchTransaction({signature,encoding: 'base64',commitment: 'confirmed'});
  console.log(`fetchRawTransaction== ${res}`)
  return res ?? null;
}

// ═══════════════════════════════════════════════════════════
// ACCOUNT QUERIES
// ═══════════════════════════════════════════════════════════

/**
 * Fetch account info (base64)
 */
export async function fetchAccount(
  account: AddressLike
): Promise<{ data: Buffer; owner: string } | null> {
  const res = await fetchAccountInfo({account,encoding: 'base64', commitment: 'confirmed' });
  let result = res
  if (result?.result){
    result = res.result
  }
  
  if (!result?.value){
    return null
  }
  const value = result.value
  if (!value?.data){
    return null
  }
  const [data, encoding] = value.data;
  
  return {
    data: Buffer.from(data, encoding),
    owner: res.result.value.owner,
  };
}

// ═══════════════════════════════════════════════════════════
// BONDING CURVE PARSING
// ═══════════════════════════════════════════════════════════

/**
 * Parse bonding curve account data
 */
export function parseBondingCurveData(data: Buffer): BondingCurveDataResult | null {
  if (data.length < BONDING_CURVE_LAYOUT.TOTAL_SIZE) {
    return null;
  }

  // Verify discriminator
  const discriminator = data.subarray(0, 8);
  if (!discriminator.equals(BONDING_CURVE_DISCRIMINATOR)) {
    return null;
  }

  return new BondingCurveDataResult(
    bs58.encode(data.subarray(8, 40)),                    // mint
    bs58.encode(data.subarray(40, 72)),                   // creator
    data.readBigUInt64LE(72),                             // virtualTokenReserves
    data.readBigUInt64LE(80),                             // virtualSolReserves
    data.readBigUInt64LE(88),                             // realTokenReserves
    data.readBigUInt64LE(96),                             // realSolReserves
    data.readBigUInt64LE(104),                            // tokenTotalSupply
    data.readUInt8(112) === 1,                            // isComplete
    bs58.encode(data.subarray(113, 145))                  // tokenProgram
  );
}

/**
 * Fetch and parse bonding curve data
 */
export async function fetchBondingCurveData(
  bondingCurveAddress: AddressLike
): Promise<BondingCurveDataResult | null> {
  const account = await fetchAccount(bondingCurveAddress);
  
  if (!account) {
    return null;
  }

  return parseBondingCurveData(account.data);
}
