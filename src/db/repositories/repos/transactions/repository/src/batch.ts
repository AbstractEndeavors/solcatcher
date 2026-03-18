  // ─────────────────────────────────────────────
  // TEMP TABLE OPS (creator signature batching)
  // ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import {TransactionsRepository} from './../TransactionsRepository.js';
import type {IdLike,SigLike,} from '@imports';
  export async function bulkInsertTmpCreatorSignatures(
    this: TransactionsRepository,
    signatures: SigLike[]): Promise<void> {
    await this.createTmpCreatorTable();
    await this.db.query(
      QueryRegistry.BULK_INSERT_TMP_CREATOR_SIGNATURES,
      [signatures]
    );
  }

  export async function fetchCreatorAccountIds(
    this: TransactionsRepository
  ): Promise<IdLike[]> {
    const res = await this.db.query<{ creator_account_id: IdLike }>(
      QueryRegistry.FETCH_CREATOR_ACCOUNT_ID
    );
    return res.rows.map((r:any) => r.creator_account_id);
  }

