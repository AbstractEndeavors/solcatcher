import { QueryRegistry } from "./../../query-registry.js";
import { isId, isSignature } from "@imports";
export async function upsertParsedLogs(params) {
    const { id, signature, parsed_logs } = params;
    if (isId(id)) {
        const result = await this.upsertParsedLogsById(id, parsed_logs);
        if (result.ok && result.value != null)
            return result;
    }
    if (isSignature(signature)) {
        const result = await this.upsertParsedLogsBySignature(signature, parsed_logs);
        if (result.ok && result.value != null)
            return result;
    }
    return { ok: false, value: null, reason: "no_valid_lookup_key" };
}
export async function upsertParsedLogsById(id, parsed_logs) {
    try {
        const result = await this.db.query(QueryRegistry.UPSERT_PARSED_LOGS_BY_ID, [id, JSON.stringify(parsed_logs)]);
        const value = result.rows[0]?.id ?? null;
        if (!value)
            return { ok: false, value: null, reason: "upsert_returned_no_id", meta: { id } };
        return { ok: true, value };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), id } };
    }
}
export async function upsertParsedLogsBySignature(signature, parsed_logs) {
    try {
        const result = await this.db.query(QueryRegistry.UPSERT_PARSED_LOGS_BY_SIGNATURE, [signature, JSON.stringify(parsed_logs)]);
        const value = result.rows[0]?.id ?? null;
        if (!value)
            return { ok: false, value: null, reason: "upsert_returned_no_id", meta: { signature } };
        return { ok: true, value };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature } };
    }
}
