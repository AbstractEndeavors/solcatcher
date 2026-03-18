import { normalizePositiveInt, normalizeBool } from './../imports.js';
import { RpcPayload } from './../schemas.js';
import { DEFAULT_COMMITMENT } from './../constants.js';
export function normalizeFetchUnsortedLimitInput(a, b) {
    // defaults
    let limit = 100;
    let latest = false;
    // ─────────────────────────────────────────
    // CASE 1: dictionary/object input
    // ─────────────────────────────────────────
    if (a && typeof a === "object" && !Array.isArray(a)) {
        const obj = a;
        const l = normalizePositiveInt(obj.limit);
        const lt = normalizeBool(obj.latest);
        if (l !== null)
            limit = l;
        if (lt !== null)
            latest = lt;
        return { limit, latest };
    }
    // ─────────────────────────────────────────
    // CASE 2: positional inputs
    // ─────────────────────────────────────────
    const aLimit = normalizePositiveInt(a);
    const aBool = normalizeBool(a);
    const bLimit = normalizePositiveInt(b);
    const bBool = normalizeBool(b);
    // a = limit
    if (aLimit !== null)
        limit = aLimit;
    // a = latest
    if (aBool !== null && aLimit === null)
        latest = aBool;
    // b overrides
    if (bLimit !== null)
        limit = bLimit;
    if (bBool !== null)
        latest = bBool;
    return { limit, latest };
}
export function extractCommitment(params) {
    if (!params || !Array.isArray(params))
        return DEFAULT_COMMITMENT;
    const last = params[params.length - 1];
    if (last && typeof last === "object" && !Array.isArray(last)) {
        const c = last.commitment;
        if (c === "processed" || c === "confirmed" || c === "finalized") {
            return c;
        }
    }
    return DEFAULT_COMMITMENT;
}
export function toUrlString(url) {
    if (typeof url === "string")
        return url;
    return `${url.scheme}://${url.netloc}`;
}
export function createRpcPayload(input) {
    let params = input.params || [];
    let id = input.id || 1;
    let jsonrpc = input.jsonrpc || '2.0';
    return new RpcPayload(jsonrpc, typeof id === 'number' ? id : parseInt(id, 10), input.method, params);
}
