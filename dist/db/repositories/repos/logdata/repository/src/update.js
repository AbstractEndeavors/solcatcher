import { QueryRegistry } from "./../../query-registry.js";
export async function update(params) {
    const values = [
        params.signature,
        params.slot,
        params.logs,
        params.program_id,
        params.pair_id,
        params.txn_id,
        params.normalizedSignatures,
        params.sorted ?? null,
    ];
    try {
        const result = await this.db.query(QueryRegistry.UPDATE, values);
        const row = result.rows[0];
        if (!row) {
            return { ok: false, value: null, reason: "update_returned_no_row", meta: { signature: params.signature } };
        }
        return { ok: true, value: this.rowToModel(row) };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature: params.signature } };
    }
}
