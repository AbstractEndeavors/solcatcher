/**
 * VERIFICATION PRIMITIVES
 *
 * Explicit validators with context propagation.
 * No magic, no defaults - every error tells you exactly what failed and where.
 */
import { getLogString as getLogString_ } from '@putkoff/abstract-logger';
function getMessage(ctx, name, string) {
    return `${ctx} ${name} ${string}`;
}
function getLogString(details, ctx, name, string, logType) {
    const message = getMessage(ctx, name, string);
    getLogString_({ message, details, logType, skip: 7 });
    return message;
}
// ============================================================
// ERROR CONTEXT
// ============================================================
function makeError(ctx, field, reason) {
    const prefix = ctx ?? 'Validation';
    return new Error(`${prefix}: ${field} ${reason}`);
}
// ============================================================
// EXISTENCE CHECKS
// ============================================================
export function requireField(value, name, ctx) {
    if (value == null || value === '') {
        const string = 'is required';
        console.log(value);
        const message = getLogString(value, ctx, name, string, 'error');
        throw makeError(ctx, name, 'is required');
    }
}
export function requireOneOf(values, fields, ctx) {
    const hasAny = fields.some(f => values[f] != null && values[f] !== '');
    if (!hasAny) {
        const string = 'is required (at least one)';
        const message = getLogString(values, ctx, null, string, 'info');
        throw makeError(ctx, fields.join(' or '), 'is required (at least one)');
    }
}
// ============================================================
// TYPE CHECKS
// ============================================================
export function verifyString(value, name, ctx) {
    requireField(value, name, ctx);
    if (typeof value !== 'string') {
        const string = 'must be a string';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be a string');
    }
}
export function verifyNumber(value, name, ctx) {
    requireField(value, name, ctx);
    if (typeof value !== 'number' || isNaN(value)) {
        const string = 'must be a number';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be a number');
    }
}
export function verifyArray(value, name, ctx) {
    requireField(value, name, ctx);
    if (!Array.isArray(value)) {
        const string = 'must be an array';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be an array');
    }
}
export function verifyNonEmptyArray(value, name, ctx) {
    verifyArray(value, name, ctx);
    if (value.length === 0) {
        const string = 'must be a non-empty array';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be a non-empty array');
    }
}
// ============================================================
// NUMERIC BOUNDS
// ============================================================
export function verifyPositiveInt(value, name, ctx) {
    verifyNumber(value, name, ctx);
    if (!Number.isInteger(value) || value < 1) {
        const string = 'must be a positive integer';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be a positive integer');
    }
}
export function verifyNonNegativeInt(value, name, ctx) {
    verifyNumber(value, name, ctx);
    if (!Number.isInteger(value) || value < 0) {
        const string = 'must be a non-negative integer';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be a non-negative integer');
    }
}
export function verifyInRange(value, name, min, max, ctx) {
    verifyNumber(value, name, ctx);
    if (value < min || value > max) {
        const string = `must be between ${min} and ${max}`;
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, `must be between ${min} and ${max}`);
    }
}
// ============================================================
// STRING LENGTH
// ============================================================
export function verifyLength(value, name, min, max, ctx) {
    verifyString(value, name, ctx);
    if (value.length < min || value.length > max) {
        const string = `must be ${min}–${max} characters`;
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, `must be ${min}–${max} characters`);
    }
}
export function verifyMinLength(value, name, min, ctx) {
    verifyString(value, name, ctx);
    if (value.length < min) {
        const string = `must be at least ${min} characters`;
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, `must be at least ${min} characters`);
    }
}
// ============================================================
// PATTERN MATCHING
// ============================================================
export function verifyPattern(value, name, pattern, patternDesc, ctx) {
    verifyString(value, name, ctx);
    if (!pattern.test(value)) {
        const string = `must match ${patternDesc}`;
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, `must match ${patternDesc}`);
    }
}
// ============================================================
// BASE58 (Solana addresses, signatures)
// ============================================================
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
export function verifyBase58(value, name, ctx) {
    verifyString(value, name, ctx);
    if (!BASE58_REGEX.test(value)) {
        const string = 'must be valid base58';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be valid base58');
    }
}
export function verifyBase58WithLength(value, name, min, max, ctx) {
    verifyLength(value, name, min, max, ctx);
    if (!BASE58_REGEX.test(value)) {
        const string = 'must be valid base58';
        const message = getLogString(value, ctx, name, string, 'info');
        throw makeError(ctx, name, 'must be valid base58');
    }
}
