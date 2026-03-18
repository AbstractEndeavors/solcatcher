import { isObject } from './imports.js';
export function normalizeString(input, field) {
    if (typeof input === "string") {
        const v = input.trim();
        if (!v)
            throw new Error(`${field} is empty`);
        return v;
    }
    if (isObject(input) && typeof input[field] === "string") {
        const v = input[field].trim();
        if (!v)
            throw new Error(`${field} is empty`);
        return v;
    }
    throw new Error(`Invalid ${field}`);
}
export function isString(value, field) {
    return normalizeString(value, field) !== null;
}
/**
 * Ensure a value can be safely treated as a string.
 * - bigint → string
 * - number / boolean → String()
 * - string → passthrough
 * - null / undefined → null (or throw, configurable)
 * - object → JSON string (bigint-safe)
 */
export function ensureString(value, opts) {
    if (value == null) {
        if (opts?.allowNull)
            return null;
        throw new TypeError(`ensureString: ${opts?.label ?? 'value'} is null/undefined`);
    }
    if (typeof value === 'string')
        return value;
    if (typeof value === 'bigint')
        return value.toString();
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
    }
    return String(value);
}
export function ensureStringOptional(value) {
    if (value == null)
        return null;
    if (typeof value === 'string')
        return value;
    if (typeof value === 'bigint')
        return value.toString();
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
    }
    return String(value);
}
