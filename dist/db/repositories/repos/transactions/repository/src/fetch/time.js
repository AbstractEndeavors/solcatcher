// ─────────────────────────────────────────────
// FETCH - time range
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import { TransactionsRepository } from './../../TransactionsRepository.js';
export async function fetchByPairInRange(pairId, range) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_PAIR_IN_RANGE, [pairId, range.start, range.end]);
    return res.rows;
}
export async function fetchByUserInRange(userAddress, range) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_USER_IN_RANGE, [userAddress, range.start, range.end]);
    return res.rows;
}
