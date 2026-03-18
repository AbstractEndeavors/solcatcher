/**
 * SOLANA VERIFICATION
 * 
 * Domain-specific validators for Solana primitives.
 * All build on the base verify module.
 */

import {
  requireField,
  verifyBase58WithLength,
  verifyPositiveInt,
} from './verify.js';

// ============================================================
// SOLANA ADDRESS (32-44 chars, base58)
// ============================================================

export function verifySolanaAddress(
  value: unknown,
  name: string,
  ctx?: string
): asserts value is string {
  verifyBase58WithLength(value, name, 32, 44, ctx);
}

// ============================================================
// DOMAIN ALIASES (explicit, not magic)
// ============================================================

export function verifyMint(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'mint', ctx);
}

export function verifyProgramId(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'program_id', ctx);
}

export function verifyAccount(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'account', ctx);
}

export function verifyUserAddress(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'user_address', ctx);
}

export function verifyBondingCurve(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'bonding_curve', ctx);
}

export function verifyAssociatedBondingCurve(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'associated_bonding_curve', ctx);
}

export function verifyPriceToken(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'price_token', ctx);
}

export function verifyMintAuthority(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'mint_authority', ctx);
}

export function verifyFreezeAuthority(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifySolanaAddress(value, 'freeze_authority', ctx);
}

// ============================================================
// SOLANA SIGNATURE (80-90 chars, base58)
// ============================================================

export function verifySignature(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifyBase58WithLength(value, 'signature', 80, 90, ctx);
}

export function verifyProcessedUntil(
  value: unknown,
  ctx?: string
): asserts value is string {
  verifyBase58WithLength(value, 'processed_until', 80, 90, ctx);
}

// ============================================================
// IDS (positive integers)
// ============================================================

export function verifyId(
  value: unknown,
  ctx?: string
): asserts value is number {
  verifyPositiveInt(value, 'id', ctx);
}

export function verifyLogId(
  value: unknown,
  ctx?: string
): asserts value is number {
  verifyPositiveInt(value, 'log_id', ctx);
}

export function verifyMetaId(
  value: unknown,
  ctx?: string
): asserts value is number {
  verifyPositiveInt(value, 'meta_id', ctx);
}

export function verifyPairId(
  value: unknown,
  ctx?: string
): asserts value is number {
  verifyPositiveInt(value, 'pair_id', ctx);
}

export function verifyTxnId(
  value: unknown,
  ctx?: string
): asserts value is number {
  verifyPositiveInt(value, 'txn_id', ctx);
}

export function verifySlot(
  value: unknown,
  ctx?: string
): asserts value is number {
  verifyPositiveInt(value, 'slot', ctx);
}

// ============================================================
// COMPOSITE VALIDATORS (multi-field)
// ============================================================

type AnyObj = Record<string, unknown>;

/**
 * Verify pairs input - handles string (mint) or object
 */
export function verifyPairsInput(input: unknown, ctx?: string): void {
  const context = ctx ?? 'verifyPairsInput';
  
  // String → treat as mint
  if (typeof input === 'string') {
    verifyMint(input, context);
    return;
  }

  if (typeof input !== 'object' || input === null) {
    throw new Error(`${context}: input must be string or object`);
  }

  const o = input as AnyObj;
  
  // Required fields
  verifyMint(o.mint ?? o.token ?? o.token_mint, context);
  verifyProgramId(o.program_id, context);
  verifyBondingCurve(o.bonding_curve, context);
  verifyAssociatedBondingCurve(o.associated_bonding_curve, context);
  
  // Optional but validated if present
  if ('log_id' in o && o.log_id != null) {
    verifyLogId(o.log_id, context);
  }
  if ('meta_id' in o && o.meta_id != null) {
    verifyMetaId(o.meta_id, context);
  }
}

/**
 * Verify metadata input - handles string (mint) or object
 */
export function verifyMetadataInput(input: unknown, ctx?: string): void {
  const context = ctx ?? 'verifyMetadataInput';
  
  // String → treat as mint
  if (typeof input === 'string') {
    verifyMint(input, context);
    return;
  }

  if (typeof input !== 'object' || input === null) {
    throw new Error(`${context}: input must be string or object`);
  }

  const o = input as AnyObj;
  verifyMint(o.mint, context);
}

/**
 * Verify transaction input - handles string (signature) or object
 */
export function verifyTransactionInput(input: unknown, ctx?: string): void {
  const context = ctx ?? 'verifyTransactionInput';
  
  // String → treat as signature
  if (typeof input === 'string') {
    verifySignature(input, context);
    return;
  }

  if (typeof input !== 'object' || input === null) {
    throw new Error(`${context}: input must be string or object`);
  }

  const o = input as AnyObj;
  verifySignature(o.signature, context);
}
