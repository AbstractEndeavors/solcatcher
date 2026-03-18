import { isPositive, extractRow, normalizeNumber, emptyObjectToNull } from './imports.js';
export function isIdArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every(isId));
}
export const isId = isPositive;
export const isIds = isIdArray;
export function normalizeId(value) {
    if (typeof value === "number")
        return value;
    if (typeof value === "object" && value && "id" in value) {
        const id = value.id;
        return typeof id === "number" ? id : null;
    }
    return null;
}
export function firstNormalizedId(...values) {
    for (const v of values) {
        if (v == null)
            continue;
        if (typeof v === "number" && Number.isInteger(v))
            return v;
        if (typeof v === "string") {
            const n = Number(v);
            if (Number.isInteger(n))
                return n;
        }
        if (typeof v === "object") {
            const obj = v;
            const nested = obj.id ?? obj.log_id ?? obj.logId;
            const n = firstNormalizedId(nested);
            if (n != null)
                return n;
        }
    }
    return null;
}
export function extractId(value) {
    return typeof value?.id === 'number' ? value.id : null;
}
export function getNonEmptyNormalizedId(obj) {
    const id = normalizeId(obj);
    return typeof id === 'number' && id > 0 ? id : null;
}
export function getIdOrNull(value) {
    return typeof value?.id === 'number' ? value.id : null;
}
export function normalizeIdFields(input, fields = "id") {
    const n = normalizeNumber(input, fields, { min: 1 });
    return typeof n === 'number' && Number.isFinite(n) ? n : null;
}
