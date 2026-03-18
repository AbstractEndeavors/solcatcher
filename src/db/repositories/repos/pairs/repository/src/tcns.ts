// ─────────────────────────────────────────────
// TRANSACTION INDEXING
// ─────────────────────────────────────────────
import { PairsRepository } from '../PairsRepository.js';
import {QueryRegistry} from './../../query-registry.js';
import {type IdLike,firstRowIdOrNull} from '@imports';
export async function appendTcns(
  this:PairsRepository,
  pairId: IdLike, 
  txnIds: IdLike[]
): Promise<IdLike> {
    if (!txnIds.length) return pairId;
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.APPEND_TCNS,
      [pairId, txnIds]
    );
    const id = firstRowIdOrNull(res);
    if (!id) {
      throw new Error('appendTcns(): pair not found');
    }
    return id;
  }


  // ─────────────────────────────────────────────
  // TRANSACTION INDEXING
  // ─────────────────────────────────────────────


 export async function appendTransaction(
  this:PairsRepository,
  pair_id: IdLike,
  txn_id: IdLike
  ): Promise<void> {
    await this.db.query(
      QueryRegistry.APPEND_TCN,
      [pair_id, txn_id]
    );
  }
