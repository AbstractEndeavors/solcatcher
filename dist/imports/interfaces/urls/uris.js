// Basic but sufficient — rejects empty strings, non-http(s), and whitespace
const URI_RE = /^https?:\/\/.{3,}/;
export function isValidUri(value) {
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
export function normalizeUri(value) {
    if (typeof value === 'string') {
        const s = value.trim();
        return isValidUri(s) ? s : null;
    }
    return null;
}
export function firstNormalizedUri(...values) {
    for (const v of values) {
        if (v == null)
            continue;
        // bare string
        const direct = normalizeUri(v);
        if (direct)
            return direct;
        // object — probe known uri field names
        if (typeof v === 'object') {
            const obj = v;
            const candidate = obj.uri ?? obj.url ?? obj.external_url ?? obj.metadata?.uri;
            const nested = normalizeUri(candidate);
            if (nested)
                return nested;
        }
    }
    return null;
}
