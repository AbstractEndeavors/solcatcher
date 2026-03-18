// ─────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────
import { MetaDataRepository } from './../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { firstRowIdOrNull, isId, isMint } from '@imports';
// Fixed insertIdentity - creates minimal stub
export async function fetch(params) {
    let row = null;
    const { id, mint } = params;
    if (isId(id)) {
        row = await this.fetchById(id);
        if (row != null)
            return row;
    }
    // Mint-only lookup (new)
    if (isMint(mint)) {
        row = await this.fetchByMint(mint);
        if (row != null)
            return row;
    }
    return null;
}
export async function fetchById(id) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_ID, [id]);
    return res.rows[0] ? this.rowToModel(res.rows[0]) : null;
}
export async function fetchByMint(mint) {
    const res = await this.db.query(QueryRegistry.FETCH_BY_MINT, [mint]);
    return res.rows[0] ? this.rowToModel(res.rows[0]) : null;
}
export async function getIdByMint(mint) {
    const res = await this.db.query(QueryRegistry.GET_ID_BY_MINT, [mint]);
    return firstRowIdOrNull(res);
    ;
}
export async function fetchPendingUri(limit = 100) {
    const res = await this.db.query(QueryRegistry.FETCH_PENDING_URI, [limit]);
    return res.rows.map((r) => this.rowToModel(r));
}
export async function fetchPendingOnchain(limit = 100) {
    const res = await this.db.query(QueryRegistry.FETCH_PENDING_ONCHAIN, [limit]);
    return res.rows.map((r) => this.rowToModel(r));
}
// In MetaDataRepository  
export async function fetchBatchByMints(mints) {
    if (!mints.length)
        return [];
    const result = await this.db.query(`SELECT * FROM metadata WHERE mint = ANY($1)`, [mints]);
    return result.rows.map(row => this.rowToModel(row));
}
