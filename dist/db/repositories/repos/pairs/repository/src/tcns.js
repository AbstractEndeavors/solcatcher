// ─────────────────────────────────────────────
// TRANSACTION INDEXING
// ─────────────────────────────────────────────
import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { firstRowIdOrNull } from '@imports';
export async function appendTcns(pairId, txnIds) {
    if (!txnIds.length)
        return pairId;
    const res = await this.db.query(QueryRegistry.APPEND_TCNS, [pairId, txnIds]);
    const id = firstRowIdOrNull(res);
    if (!id) {
        throw new Error('appendTcns(): pair not found');
    }
    return id;
}
// ─────────────────────────────────────────────
// TRANSACTION INDEXING
// ─────────────────────────────────────────────
export async function appendTransaction(pair_id, txn_id) {
    await this.db.query(QueryRegistry.APPEND_TCN, [pair_id, txn_id]);
}
