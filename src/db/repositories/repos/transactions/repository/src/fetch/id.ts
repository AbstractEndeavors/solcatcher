  // ─────────────────────────────────────────────
  // FETCH - by identity
  // ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import {TransactionsRepository} from './../../TransactionsRepository.js';
import type {TransactionsRow,IdLike,MintLike,SigLike,} from '@imports';

export async function fetchById(
  this: TransactionsRepository,
  id: IdLike): Promise<TransactionsRow | null> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_ID,
      [id]
    );
    return res.rows[0] ?? null;
  }
export async function fetchBySignature(
  this: TransactionsRepository,
  signature: SigLike): Promise<TransactionsRow | null> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_SIGNATURE,
      [signature]
    );
    return res.rows[0] ?? null;
  }
export async function fetchByPair(
  this: TransactionsRepository,
  pairId: IdLike): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_PAIR_ID,
      [pairId]
    );
    return res.rows;
  }
export async function fetchByMint(
  this: TransactionsRepository,
 mint: MintLike): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_MINT,
      [mint]
    );
    return res.rows;
  }
