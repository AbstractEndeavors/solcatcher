import type {IdLike,MethodLike} from './imports.js';
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
