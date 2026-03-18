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
export declare function calculatePrecisePrice(solAmount: bigint, tokenAmount: bigint, scale?: bigint): PrecisePrice;
/**
 * Convert lamports to SOL (for UI display only).
 */
export declare function lamportsToSol(lamports: bigint): number;
/**
 * Convert token base units to UI amount given decimals.
 */
export declare function toUiAmount(baseUnits: bigint, decimals: number): number;
/**
 * Check if a bigint value is safe to convert to Number without precision loss.
 */
export declare function isSafeForNumber(value: bigint): boolean;
/**
 * Validate that a price is reasonable (not NaN, not Infinity, positive).
 */
export declare function isValidPrice(price: number): boolean;
