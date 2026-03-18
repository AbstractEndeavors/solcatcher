// src/pipeline/pda/genesis.ts

import {
  fetchSignatures,
  findOldestSignature,
  fetchParsedTransaction,
} from './fetcher.js';
import { deriveMetadataPDA, deriveBondingCurvePDA } from './derivation.js';
import { PROGRAM_IDS } from './constants.js';
import { GenesisInfoResult } from './schemas.js';
import type { MintLike, AddressLike,SigLike } from '@imports';
import {getPubkeyString,getBase58} from '@imports';
// src/pipeline/handlers/pairEnrich/fetcher.ts
import { PublicKey } from '@solana/web3.js';
import {fetchSignaturesForAddress} from '@rateLimiter';
import {getPubkey} from '@imports';


// ═══════════════════════════════════════════════════════════
// CREATOR EXTRACTION
// ═══════════════════════════════════════════════════════════

/**
 * Check if instruction is Metaplex metadata init
 */
export function isMetaplexMetadataInit(ix: any): boolean {
  if (ix.program !== 'spl-token-metadata') {
    return false;
  }
  
  const type = ix.parsed?.type;
  return (
    type === 'createMetadataAccount' ||
    type === 'createMetadataAccountV2' ||
    type === 'createMetadataAccountV3' ||
    type === 'createMetadataAccountV4'
  );
}

/**
 * Check if instruction is pump.fun create
 */
export function isPumpFunCreate(ix: any, program_id: AddressLike): boolean {
  return ix.program_id === program_id && ix.parsed?.type === 'create';
}

/**
 * Extract creator from parsed transaction
 */
export function extractCreator(tx: any, program_id: AddressLike): string | null {
  const instructions = tx?.transaction?.message?.instructions;
  if (!instructions) return null;

  // 1. Try Metaplex metadata init (payer)
  for (const ix of instructions) {
    if (isMetaplexMetadataInit(ix)) {
      return ix.parsed?.info?.payer ?? null;
    }
  }

  // 2. Try pump.fun create instruction
  for (const ix of instructions) {
    if (isPumpFunCreate(ix, program_id)) {
      return ix.parsed?.info?.user ?? null;
    }
  }

  // 3. Try system createAccount (source)
  for (const ix of instructions) {
    if (ix.program === 'system' && ix.parsed?.type === 'createAccount') {
      return ix.parsed?.info?.source ?? null;
    }
  }

  // 4. Fallback: first signer
  const signers = tx?.transaction?.message?.accountKeys?.filter(
    (k: any) => k.signer
  );
  return signers?.[0]?.pubkey ?? null;
}

// ═══════════════════════════════════════════════════════════
// GENESIS STRATEGIES
// ═══════════════════════════════════════════════════════════

/**
 * Strategy 1: Metadata PDA (fast - few signatures)
 */
export async function tryMetadataPDA(
  mint: MintLike,
  program_id: AddressLike
): Promise<GenesisInfoResult | null> {
  const metadataPDA = deriveMetadataPDA(mint);
  
  // Metadata PDA has very few signatures, get recent
  const signatures = await fetchSignatures(getBase58(metadataPDA), 10);
  
  if (signatures.length === 0) {
    return null;
  }

  // Oldest in the batch is likely genesis
  const oldest = signatures[signatures.length - 1];
  
  const tx = await fetchParsedTransaction(oldest.signature);
  if (!tx) {
    return null;
  }

  const creator = extractCreator(tx, program_id);

  return new GenesisInfoResult(
    oldest.signature,
    oldest.blockTime,
    oldest.slot,
    creator,
    'metadata_pda'
  );
}

/**
 * Strategy 2: Bonding Curve PDA (canonical for pump.fun)
 */
export async function tryBondingCurvePDA(
  mint: MintLike,
  program_id: AddressLike
): Promise<GenesisInfoResult | null> {
  const bondingCurvePDA = deriveBondingCurvePDA(mint, program_id);
  
  // Find oldest signature (may require pagination)
  const oldest = await findOldestSignature(getBase58(bondingCurvePDA));
  
  if (!oldest) {
    return null;
  }

  const tx = await fetchParsedTransaction(oldest.signature);
  if (!tx) {
    return null;
  }

  const creator = extractCreator(tx, getPubkeyString(program_id));

  return new GenesisInfoResult(
    oldest.signature,
    oldest.blockTime,
    oldest.slot,
    creator,
    'bonding_curve'
  );
}

/**
 * Strategy 3: Mint Account (fallback - slowest)
 */
export async function tryMintAccount(
  mint: MintLike,
  program_id: AddressLike
): Promise<GenesisInfoResult | null> {
  const oldest = await findOldestSignature(getPubkeyString(mint));
  
  if (!oldest) {
    return null;
  }

  const tx = await fetchParsedTransaction(oldest.signature);
  if (!tx) {
    return null;
  }

  const creator = extractCreator(tx, program_id);

  return new GenesisInfoResult(
    oldest.signature,
    oldest.blockTime,
    oldest.slot,
    creator,
    'mint_account'
  );
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Quick genesis resolution - metadata PDA only (fast)
 */
export async function resolveGenesisQuick(
  mint: MintLike,
  program_id: AddressLike = PROGRAM_IDS.PUMP_FUN
): Promise<GenesisInfoResult | null> {
  return await tryMetadataPDA(mint, getPubkeyString(program_id));
}

/**
 * Full genesis resolution - all strategies
 * 
 * Order:
 * 1. Metadata PDA (fast)
 * 2. Bonding Curve PDA (canonical)
 * 3. Mint Account (fallback)
 */
export async function resolveGenesisFull(
  mint: MintLike,
  program_id: AddressLike = PROGRAM_IDS.PUMP_FUN
): Promise<GenesisInfoResult | null> {
  // Strategy 1: Metadata PDA (fast)
  if (!program_id){
    return null
  }
  const metadataResult = await tryMetadataPDA(mint,getPubkeyString(program_id));
  if (metadataResult) {
    return metadataResult;
  }

  // Strategy 2: Bonding Curve PDA (canonical)
  const bondingCurveResult = await tryBondingCurvePDA(mint, program_id);
  if (bondingCurveResult) {
    return bondingCurveResult;
  }

  // Strategy 3: Mint Account (fallback)
  const mintResult = await tryMintAccount(mint, getPubkeyString(program_id));
  if (mintResult) {
    return mintResult;
  }

  return null;
}

/**
 * Resolve genesis with bonding curve priority
 * 
 * For pump.fun tokens, bonding curve is more canonical
 */
export async function resolveGenesisBondingCurveFirst(
  mint: MintLike,
  program_id: AddressLike = PROGRAM_IDS.PUMP_FUN
): Promise<GenesisInfoResult | null> {
  // Try bonding curve first (canonical for pump.fun)
  const bondingCurveResult = await tryBondingCurvePDA(mint, program_id);
  console.log('resolveGenesisBondingCurveFirst bondingCurveResult', bondingCurveResult)
  if (bondingCurveResult) {
    return bondingCurveResult;
  }

  // Fallback to metadata PDA
  const metadataResult = await tryMetadataPDA(mint, getPubkeyString(program_id));
  console.log('resolveGenesisBondingCurveFirst metadataResult', metadataResult)
  if (metadataResult) {
    return metadataResult;
  }

  // Last resort: mint account
  const mintResult = await tryMintAccount(mint, getPubkeyString(program_id));
  console.log('resolveGenesisBondingCurveFirst mintResult', mintResult)
  return mintResult;
}


export const METAPLEX_PROGRAM_ID = getPubkey(
  PROGRAM_IDS.METADATA
);

export function getMetadataPda(mint: any): PublicKey {
  mint = getPubkey(mint)
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METAPLEX_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METAPLEX_PROGRAM_ID
  );
  return pda;
}

export async function getFirstTx(
  account: any
):Promise<SigDict | null> {
  const resp = await fetchSignaturesForAddress({account});
  const sigs = resp.result

  if (!sigs || !sigs.length) return null;

  const sig = sigs[sigs.length-1];
  if (!sig?.signature){
    return null;
  }
  return sig
  }

export interface SigDict {
  blockTime:number;
  confirmationStatus: string;
  err: any;
  memo: any;
  signature: string;
  slot: number;
}
export async function getTokenCreationInfo(mint: string):Promise<any> {

  const metadataPda = getMetadataPda(mint);

  // 1️⃣ Try metadata PDA (best)
  let signature = await getFirstTx(mint);
  if (signature) {
    return signature;
  }

  // 2️⃣ Fallback: mint account
  signature = await getFirstTx(mint);
  if (signature) {
    return signature;
  }
}
