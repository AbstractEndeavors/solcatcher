export function ensureArray(x) {
    return Array.isArray(x) ? x : x ? [x] : [];
}
