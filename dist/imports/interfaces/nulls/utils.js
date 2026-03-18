export function firstOrNull(value) {
    if (!value)
        return null;
    return Array.isArray(value) ? value[0] ?? null : value;
}
export function emptyObjectToNull(v) {
    return v == null ? null : v;
}
