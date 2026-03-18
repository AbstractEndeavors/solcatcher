// ──────────────────────────────────────────────────────
// INSERT
// ──────────────────────────────────────────────────────
import { LogPayloadRepository, QueryRegistry } from './imports.js';
export async function insertBatch(rows) {
    if (!rows.length)
        return [];
    const { rows: inserted } = await this.db.query(QueryRegistry.INSERT_BATCH, [JSON.stringify(rows)]);
    const map = new Map();
    for (const r of inserted) {
        const key = `${r.signature}:${r.program_id}`;
        let entry = map.get(key);
        if (!entry) {
            entry = {
                signature: r.signature,
                program_id: r.program_id,
                ids: [],
                count: 0,
            };
            map.set(key, entry);
        }
        entry.ids.push(r.id);
        entry.count++;
    }
    return [...map.values()];
}
/**
 * Insert a single unknown instruction record.
 */
export async function insertUnknownInstruction(params) {
    await this.db.query(QueryRegistry.INSERT_UNKNOWN_INSTRUCTION, [
        params.signature,
        params.program_id,
        params.invocation_index,
        params.discriminator,
        params.data_prefix,
        params.reason,
    ]);
}
