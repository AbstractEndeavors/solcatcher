import type {Commitment,UrlDict,MethodLike,IntLike} from './../src/index.js';
import {DEFAULT_COMMITMENT,RpcPayload} from './../src/index.js';
export function extractCommitment(params: unknown[]): Commitment {
    if (!params || !Array.isArray(params)) return DEFAULT_COMMITMENT;
    
    const last = params[params.length - 1];
    if (last && typeof last === "object" && !Array.isArray(last)) {
      const c = (last as any).commitment;
      if (c === "processed" || c === "confirmed" || c === "finalized") {
        return c;
      }
    }
    return DEFAULT_COMMITMENT;
}
export function toUrlString(url: UrlDict | string): string {
  if (typeof url === "string") return url;
  return `${url.scheme}://${url.netloc}`;
}

export function createRpcPayload(
  method: MethodLike,
  params: unknown[] = [],
  id: IntLike = 1,
  jsonrpc: IntLike = '2.0'
): RpcPayload {
  return new RpcPayload(
    jsonrpc as string,
    typeof id === 'number' ? id : parseInt(id as string, 10),
    method,
    params
  );
}


