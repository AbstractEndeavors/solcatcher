/**
 * Default scale for price calculations.
 * 10^12 gives us 12 decimal places of precision.
 * This is enough for SOL/token prices on pump.fun.
 */
export declare const DEFAULT_PRICE_SCALE = 1000000000000n;
/**
 * SOL decimals (lamports)
 */
export declare const SOL_DECIMALS = 9;
export declare const LAMPORTS_PER_SOL = 1000000000n;
/**
 * Maximum safe integer for JS Number
 */
export declare const MAX_SAFE_INTEGER: bigint;
