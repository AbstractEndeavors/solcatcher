import { DEFAULT_COMMITMENT, RpcPayload } from './../src/index.js';
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
export function createRpcPayload(method, params = [], id = 1, jsonrpc = '2.0') {
    return new RpcPayload(jsonrpc, typeof id === 'number' ? id : parseInt(id, 10), method, params);
}
