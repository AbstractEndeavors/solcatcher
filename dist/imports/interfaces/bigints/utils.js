// =============================================================================
// SAFE CONVERSIONS
// =============================================================================
import { MAX_SAFE_INTEGER } from './imports.js';
/**
 * Safely convert bigint to number, with overflow check.
 * Throws if value exceeds MAX_SAFE_INTEGER.
 */
export function bigintToNumber(value) {
    if (value > MAX_SAFE_INTEGER || value < -MAX_SAFE_INTEGER) {
        throw new RangeError(`bigintToNumber: value ${value} exceeds MAX_SAFE_INTEGER (${MAX_SAFE_INTEGER})`);
    }
    return Number(value);
}
/**
 * Safely convert bigint to number, clamping to MAX_SAFE_INTEGER if overflow.
 * Use when you need a number but can tolerate precision loss for huge values.
 * Logs warning on clamp.
 */
export function bigintToNumberClamped(value, context) {
    if (value > MAX_SAFE_INTEGER) {
        console.warn(`bigintToNumberClamped: ${context ?? 'value'} ${value} clamped to MAX_SAFE_INTEGER`);
        return Number.MAX_SAFE_INTEGER;
    }
    if (value < -MAX_SAFE_INTEGER) {
        console.warn(`bigintToNumberClamped: ${context ?? 'value'} ${value} clamped to -MAX_SAFE_INTEGER`);
        return -Number.MAX_SAFE_INTEGER;
    }
    return Number(value);
}
/**
 * Convert bigint to string (always safe, for DB NUMERIC columns).
 */
export function bigintToString(value) {
    return value.toString();
}
// =============================================================================
// COMPARISON (bigint-safe)
// =============================================================================
export function min(a, b) {
    return a < b ? a : b;
}
export function max(a, b) {
    return a > b ? a : b;
}
export function abs(value) {
    return value < 0n ? -value : value;
}
export function normalizeBigInt(value) {
    if (typeof value === 'bigint')
        return value;
    if (typeof value === 'number')
        return BigInt(value);
    if (typeof value === 'string')
        return BigInt(value);
    return 0n;
}
