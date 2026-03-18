/**
 * Safely convert bigint to number, with overflow check.
 * Throws if value exceeds MAX_SAFE_INTEGER.
 */
export declare function bigintToNumber(value: bigint): number;
/**
 * Safely convert bigint to number, clamping to MAX_SAFE_INTEGER if overflow.
 * Use when you need a number but can tolerate precision loss for huge values.
 * Logs warning on clamp.
 */
export declare function bigintToNumberClamped(value: bigint, context?: string): number;
/**
 * Convert bigint to string (always safe, for DB NUMERIC columns).
 */
export declare function bigintToString(value: bigint): string;
export declare function min(a: bigint, b: bigint): bigint;
export declare function max(a: bigint, b: bigint): bigint;
export declare function abs(value: bigint): bigint;
export declare function normalizeBigInt(value: unknown): bigint;
