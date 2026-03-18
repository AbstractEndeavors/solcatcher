// ─────────────────────────────────────────────
// EXISTS (fast path checks)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import { TransactionsRepository } from './../TransactionsRepository.js';
export async function existsBySignature(signature) {
    const res = await this.db.query(QueryRegistry.EXISTS_BY_SIGNATURE, [signature]);
    return res.rows.length > 0;
}
export async function existsById(id) {
    const res = await this.db.query(QueryRegistry.EXISTS_BY_ID, [id]);
    return res.rows.length > 0;
}
