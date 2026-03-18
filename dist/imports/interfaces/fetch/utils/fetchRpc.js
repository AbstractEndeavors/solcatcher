import { extractCommitment, createRpcPayload } from './utils.js';
import { DEFAULT_HEADERS } from './../constants.js';
export function getFetchOptions(params) {
    const body = JSON.stringify(params.body);
    const headers = params.headers || DEFAULT_HEADERS;
    const method = params.method || 'POST';
    return {
        method,
        headers,
        body,
    };
}
export async function fetchIt(params) {
    const { url, method, headers, body, } = params;
    const options = getFetchOptions({ method, headers, body });
    return await fetch(url, options);
}
export async function fetchRpc(url, options) {
    options.commitment = options.commitment || extractCommitment(options.params);
    const { method, params, id, jsonrpc, headers, intent, context } = options;
    const body = createRpcPayload({ method, params, id, jsonrpc });
    if (!body)
        return null;
    try {
        const response = await fetchIt({ url, body, headers });
        const text = await response.text();
        return JSON.parse(text);
    }
    catch (err) {
        console.error({
            logType: 'error',
            function_name: 'fetchRpc',
            message: `${url} fetch failed`,
            details: {
                method,
                body,
                error: err instanceof Error ? err.message : String(err)
            }
        });
        return null;
    }
}
