// ─────────────────────────────────────────────
// EXISTS (fast path checks)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import {TransactionsRepository} from './../TransactionsRepository.js';
import type {IdLike,SigLike,PairRollup} from '@imports';
  export async function existsBySignature(
    this: TransactionsRepository,
    signature: SigLike
  ): Promise<boolean> {
    const res = await this.db.query(
      QueryRegistry.EXISTS_BY_SIGNATURE,
      [signature]
    );
    return res.rows.length > 0;
  }

  export async function existsById(
    this: TransactionsRepository,
    id: IdLike
  ): Promise<boolean> {
    const res = await this.db.query(
      QueryRegistry.EXISTS_BY_ID,
      [id]
    );
    return res.rows.length > 0;
  }
