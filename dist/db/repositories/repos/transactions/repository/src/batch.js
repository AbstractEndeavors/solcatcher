// ─────────────────────────────────────────────
// TEMP TABLE OPS (creator signature batching)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import { TransactionsRepository } from './../TransactionsRepository.js';
export async function bulkInsertTmpCreatorSignatures(signatures) {
    await this.createTmpCreatorTable();
    await this.db.query(QueryRegistry.BULK_INSERT_TMP_CREATOR_SIGNATURES, [signatures]);
}
export async function fetchCreatorAccountIds() {
    const res = await this.db.query(QueryRegistry.FETCH_CREATOR_ACCOUNT_ID);
    return res.rows.map((r) => r.creator_account_id);
}
