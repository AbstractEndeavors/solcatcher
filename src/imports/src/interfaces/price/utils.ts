/**
 * precision.ts
 * 
 * Safe numeric operations for Solana amounts.
 * 
 * Problem: BigInt(d.sol_amount) / BigInt(d.token_amount) loses precision
 * Solution: Scaled integer division, then convert to float at the edge
 * 
 * Rule: Keep bigint as long as possible. Convert to Number only for:
 *   - UI display
 *   - Final float price (after scaled computation)
 */

import type { PrecisePrice } from './types.js';
import {DEFAULT_PRICE_SCALE,LAMPORTS_PER_SOL,MAX_SAFE_INTEGER} from './constants.js';

// =============================================================================
// PRECISE PRICE CALCULATION
// =============================================================================

/**
 * Calculate price with full precision using scaled integer math.
 * 
 * Formula: price = sol_amount / token_amount
 * 
 * Scaled: scaled_price = (sol_amount * SCALE) / token_amount
 * Float:  price = scaled_price / SCALE
 * 
 * This preserves precision for small token amounts.
 */
export function calculatePrecisePrice(
  solAmount: bigint,
  tokenAmount: bigint,
  scale: bigint = DEFAULT_PRICE_SCALE
): PrecisePrice {
  // Coerce at the boundary — callers pass unknown numeric types
  const sol = BigInt(solAmount);
  const tokens = BigInt(tokenAmount);

  if (tokens === 0n) {
    return { scaled: 0n, scale, float: 0 };
  }
  const scaled = (sol * scale) / tokens;
  const float = Number(scaled) / Number(scale);
  return { scaled, scale, float };
}
// =============================================================================
// UI AMOUNT FORMATTING
// =============================================================================

/**
 * Convert lamports to SOL (for UI display only).
 */
export function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / Number(LAMPORTS_PER_SOL);
}

/**
 * Convert token base units to UI amount given decimals.
 */
export function toUiAmount(baseUnits: bigint, decimals: number): number {
  const divisor = 10n ** BigInt(decimals);
  // Use scaled division for precision
  const scaled = (baseUnits * 1_000_000n) / divisor;
  return Number(scaled) / 1_000_000;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if a bigint value is safe to convert to Number without precision loss.
 */
export function isSafeForNumber(value: bigint): boolean {
  return value <= MAX_SAFE_INTEGER && value >= -MAX_SAFE_INTEGER;
}

/**
 * Validate that a price is reasonable (not NaN, not Infinity, positive).
 */
export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

