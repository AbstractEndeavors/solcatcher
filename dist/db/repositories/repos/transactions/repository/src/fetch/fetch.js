// ─────────────────────────────────────────────
// FETCH - pagination (cursor-based)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import { TransactionsRepository } from './../../TransactionsRepository.js';
export async function fetchLatest(limit) {
    const res = await this.db.query(QueryRegistry.FETCH_LATEST, [limit]);
    return res.rows;
}
export async function fetchOldest(limit) {
    const res = await this.db.query(QueryRegistry.FETCH_OLDEST, [limit]);
    return res.rows;
}
export async function fetchPageByPair(pairId, cursor) {
    const res = await this.db.query(QueryRegistry.FETCH_PAGE_BY_PAIR, [pairId, cursor.before, cursor.limit]);
    return res.rows;
}
export async function fetchPageByUser(userAddress, cursor) {
    const res = await this.db.query(QueryRegistry.FETCH_PAGE_BY_USER, [userAddress, cursor.before, cursor.limit]);
    return res.rows;
} // ─────────────────────────────────────────────
// FETCH - pagination (cursor-based)
// ─────────────────────────────────────────────
