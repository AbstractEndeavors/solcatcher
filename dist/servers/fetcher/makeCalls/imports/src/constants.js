export const inflightRegistry = new Map();
export const DEFAULT_COMMITMENT = "confirmed";
export class RpcPayload {
    jsonrpc;
    id;
    method;
    params;
    constructor(jsonrpc, id, method, params) {
        this.jsonrpc = jsonrpc;
        this.id = id;
        this.method = method;
        this.params = params;
    }
    toString() {
        return JSON.stringify({
            jsonrpc: this.jsonrpc,
            id: this.id,
            method: this.method,
            params: this.params,
        });
    }
}
