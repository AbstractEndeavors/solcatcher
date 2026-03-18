import { DerivedPDAsResult } from "@rateLimiter";
import type {PairRow,SigLike,MintLike} from '@imports';
// src/db/repositories/cache.ts
export class PipelineCache {
  private readonly pdas        = new Map<MintLike, DerivedPDAsResult>();
  private readonly pairs       = new Map<MintLike, PairRow>();
  private readonly signatures  = new Map<MintLike, SigLike>();
  private readonly pairsDone   = new Set<MintLike>();  // mint → complete
  private readonly metaDone    = new Set<MintLike>();  // mint → complete

  // ── PDA ──────────────────────────────────────────────
  getPdas(mint: MintLike): DerivedPDAsResult | null { return this.pdas.get(mint) ?? null; }
  setPdas(mint: MintLike, r: DerivedPDAsResult): void { this.pdas.set(mint, r); }

  // ── Pair row ─────────────────────────────────────────
  getPair(mint: MintLike): PairRow | null { return this.pairs.get(mint) ?? null; }
  setPair(mint: MintLike, row: PairRow): void { this.pairs.set(mint, row); }

  // ── Signature ────────────────────────────────────────
  getSignature(mint: MintLike): SigLike | null { return this.signatures.get(mint) ?? null; }
  setSignature(mint: MintLike, sig: SigLike): void { this.signatures.set(mint, sig); }

  // ── Completion flags ─────────────────────────────────
  isPairComplete(mint: MintLike): boolean { return this.pairsDone.has(mint); }
  setPairComplete(mint: MintLike): void   { this.pairsDone.add(mint); }

  isMetaComplete(mint: MintLike): boolean { return this.metaDone.has(mint); }
  setMetaComplete(mint: MintLike): void   { this.metaDone.add(mint); }

  clear(): void {
    this.pdas.clear();
    this.pairs.clear();
    this.signatures.clear();
    this.pairsDone.clear();
    this.metaDone.clear();
  }
}