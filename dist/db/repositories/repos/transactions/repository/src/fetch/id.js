// ─────────────────────────────────────────────
// FETCH - by identity
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import { TransactionsRepository } from './../../TransactionsRepository.js';
export async function fetchById(id) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_ID, [id]);
    return res.rows[0] ?? null;
}
export async function fetchBySignature(signature) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_SIGNATURE, [signature]);
    return res.rows[0] ?? null;
}
export async function fetchByPair(pairId) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_PAIR_ID, [pairId]);
    return res.rows;
}
export async function fetchByMint(mint) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_MINT, [mint]);
    return res.rows;
}
