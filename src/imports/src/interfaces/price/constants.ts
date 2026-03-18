// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default scale for price calculations.
 * 10^12 gives us 12 decimal places of precision.
 * This is enough for SOL/token prices on pump.fun.
 */
export const DEFAULT_PRICE_SCALE = 1_000_000_000_000n; // 10^12

/**
 * SOL decimals (lamports)
 */
export const SOL_DECIMALS = 9;
export const LAMPORTS_PER_SOL = 1_000_000_000n;

/**
 * Maximum safe integer for JS Number
 */
export const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
