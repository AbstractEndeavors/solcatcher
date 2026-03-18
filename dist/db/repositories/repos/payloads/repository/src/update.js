// ──────────────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────────────
import { LogPayloadRow, LogPayloadRepository, QueryRegistry, } from './imports.js';
export async function markProcessed(id) {
    const result = await this.db.query(QueryRegistry.MARK_PROCESSED, [id]);
    const row = result.rows[0];
    return row ? this.rowToModel(row) : null;
}
export async function markFailed(id) {
    const result = await this.db.query(QueryRegistry.MARK_FAILED, [id]);
    const row = result.rows[0];
    return row ? this.rowToModel(row) : null;
}
export async function setDecodedData(id, data) {
    const result = await this.db.query(QueryRegistry.SET_DECODED_DATA, [id, JSON.stringify(data)]);
    const row = result[0];
    return row;
}
export async function setDecodable(id) {
    const result = await this.db.query(QueryRegistry.SET_DECODABLE, [id]);
    const row = result.rows[0];
    return row ? this.rowToModel(row) : null;
}
export async function setUndecodable(id) {
    const result = await this.db.query(QueryRegistry.SET_UNDECODABLE, [id]);
    const row = result.rows[0];
    return row ? this.rowToModel(row) : null;
}
