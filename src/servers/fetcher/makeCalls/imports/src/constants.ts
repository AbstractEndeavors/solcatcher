import type {IdLike,MethodLike} from './../src/index.js';
export type FetchIntent = 'authoritative' | 'enrichment' | 'repair';
export type Commitment = "processed" | "confirmed" | "finalized";
export const inflightRegistry = new Map<string, Promise<any>>();
export const DEFAULT_COMMITMENT = "confirmed";
export class RpcPayload {
  constructor(
    public readonly jsonrpc: string,
    public readonly id: IdLike,
    public readonly method: MethodLike,
    public readonly params: unknown[]
  ) {}

  toString(): string {
    return JSON.stringify({
      jsonrpc: this.jsonrpc,
      id: this.id,
      method: this.method,
      params: this.params,
    });
  }
}