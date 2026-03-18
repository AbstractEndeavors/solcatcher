// ─────────────────────────────────────────────
// ROLLUPS
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import { TransactionsRepository } from './../TransactionsRepository.js';
export async function upsertPairRollup(pairId, solVolume, tokenVolume) {
    await this.db.query(QueryRegistry.UPSERT_PAIR_ROLLUP, [pairId, solVolume, tokenVolume]);
}
export async function fetchPairRollup(pairId) {
    const res = await this.db.query(QueryRegistry.FETCH_PAIR_ROLLUP, [pairId]);
    return res.rows[0] ?? null;
}
