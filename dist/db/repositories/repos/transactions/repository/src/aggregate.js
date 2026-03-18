// ─────────────────────────────────────────────
// AGGREGATES
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import { TransactionsRepository } from './../TransactionsRepository.js';
export async function countByPair(pairId) {
    const res = await this.db.query(QueryRegistry.COUNT_BY_PAIR, [pairId]);
    return parseInt(res.rows[0]?.count ?? "0", 10);
}
export async function countByUser(userAddress) {
    const res = await this.db.query(QueryRegistry.COUNT_BY_USER, [userAddress]);
    return parseInt(res.rows[0]?.count ?? "0", 10);
}
export async function sumVolumeByPair(pairId) {
    const res = await this.db.query(QueryRegistry.SUM_VOLUME_BY_PAIR, [pairId]);
    return res.rows[0] ?? null;
}
export async function sumVolumeByUser(userAddress) {
    const res = await this.db.query(QueryRegistry.SUM_VOLUME_BY_USER, [userAddress]);
    return res.rows[0] ?? null;
}
