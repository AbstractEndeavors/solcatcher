// ─────────────────────────────────────────────
// FETCH - by user
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import { TransactionsRepository } from './../../TransactionsRepository.js';
export async function fetchByUser(userAddress, limit = 1000) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_USER, [userAddress, limit]);
    return res.rows;
}
export async function fetchByUserAndPair(userAddress, pairId) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_USER_AND_PAIR, [userAddress, pairId]);
    return res.rows;
}
// ─────────────────────────────────────────────
// FETCH - by creator
// ─────────────────────────────────────────────
export async function fetchByCreator(creator, limit = 1000) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_CREATOR, [creator, limit]);
    return res.rows;
}
