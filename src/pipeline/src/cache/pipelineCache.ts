// src/pipeline/cache/PipelineCache.ts
export class PipelineCache {
  private readonly pdas = new Map<string, DerivedPDAsResult>();
  private readonly pairs = new Map<string, PairRow>();
  private readonly signatures = new Map<string, SigLike>();

  getPdas(mint: string): DerivedPDAsResult | null {
    return this.pdas.get(mint) ?? null;
  }
  setPdas(mint: string, result: DerivedPDAsResult): void {
    this.pdas.set(mint, result);
  }

  getPair(mint: string): PairRow | null {
    return this.pairs.get(mint) ?? null;
  }
  setPair(mint: string, row: PairRow): void {
    this.pairs.set(mint, row);
  }

  getSignature(mint: string): SigLike | null {
    return this.signatures.get(mint) ?? null;
  }
  setSignature(mint: string, sig: SigLike): void {
    this.signatures.set(mint, sig);
  }

  clear(): void {
    this.pdas.clear();
    this.pairs.clear();
    this.signatures.clear();
  }
}
