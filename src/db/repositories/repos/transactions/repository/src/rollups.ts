// ─────────────────────────────────────────────
  // ROLLUPS
  // ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import {TransactionsRepository} from './../TransactionsRepository.js';
import type {IdLike,BigIntLike,PairRollup} from '@imports';
  export async function upsertPairRollup(
    this: TransactionsRepository,
    pairId: IdLike,
    solVolume: BigIntLike,
    tokenVolume: BigIntLike
  ): Promise<void> {
    await this.db.query(
      QueryRegistry.UPSERT_PAIR_ROLLUP,
      [pairId, solVolume, tokenVolume]
    );
  }

  export async function fetchPairRollup(
    this: TransactionsRepository,
    pairId: IdLike
  ): Promise<PairRollup | null> {
    const res = await this.db.query<PairRollup>(
      QueryRegistry.FETCH_PAIR_ROLLUP,
      [pairId]
    );
    return res.rows[0] ?? null;
  }
