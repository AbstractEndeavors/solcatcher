import { isObject } from './imports.js';
// ============================================================
// ID/SIGNATURE TYPES
// ============================================================
export function normalizePositiveInt(value) {
    if (typeof value === "number") {
        return Number.isInteger(value) && value > 0 ? value : null;
    }
    if (typeof value === "string") {
        if (!/^\d+$/.test(value))
            return null;
        const n = Number(value);
        return n > 0 ? n : null;
    }
    return null;
}
export function toPositiveInt(value) {
    const n = typeof value === "number"
        ? value
        : typeof value === "string" && /^\d+$/.test(value)
            ? Number(value)
            : null;
    if (n === null)
        return null;
    if (!Number.isInteger(n) || n <= 0)
        return null;
    return n;
}
export function isPositive(value) {
    return toPositiveInt(value) !== null;
}
function applyNumberBounds(value, field, opts) {
    if (opts?.min !== undefined && value < opts.min) {
        throw new Error(`${field} < ${opts.min}`);
    }
    if (opts?.max !== undefined && value > opts.max) {
        throw new Error(`${field} > ${opts.max}`);
    }
    return value;
}
export function normalizeNumber(input, fields, opts) {
    const keys = Array.isArray(fields) ? fields : [fields];
    // ─────────────────────────────
    // Fast path: already a number
    // ─────────────────────────────
    if (typeof input === "number") {
        if (!Number.isFinite(input)) {
            throw new Error(`Invalid number`);
        }
        return applyNumberBounds(input, keys[0], opts);
    }
    let n = null;
    // ─────────────────────────────
    // String input
    // ─────────────────────────────
    if (typeof input === "string" && input.trim()) {
        n = Number(input);
    }
    // ─────────────────────────────
    // Object input: try all fields
    // ─────────────────────────────
    else if (isObject(input)) {
        for (const key of keys) {
            const v = input[key];
            if (typeof v === "number") {
                n = v;
                break;
            }
            if (typeof v === "string" && v.trim()) {
                n = Number(v);
                break;
            }
        }
    }
    if (n === null || !Number.isFinite(n)) {
        throw new Error(`Invalid ${keys.join(" | ")}`);
    }
    return applyNumberBounds(n, keys[0], opts);
}
