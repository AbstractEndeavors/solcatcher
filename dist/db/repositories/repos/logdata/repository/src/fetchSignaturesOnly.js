import { QueryRegistry } from "./../../query-registry.js";
import { isTruthyBool, isLimit, isId, isSignature } from '@imports';
export async function fetchSignaturesOnly(params) {
    const { id, signature, limit, latest } = params;
    if (isLimit(limit)) {
        const result = await this.fetchSignaturesOnlyByLimit({ limit, latest });
        if (result.ok && result.value != null)
            return result;
    }
    if (isId(id)) {
        const result = await this.fetchSignaturesOnlyById(id);
        if (result.ok && result.value != null)
            return result;
    }
    if (isSignature(signature)) {
        const result = await this.fetchSignaturesOnlyBySignature(signature);
        if (result.ok && result.value != null)
            return result;
    }
    return { ok: true, value: null };
}
export async function fetchSignaturesOnlyById(id) {
    try {
        const result = await this.db.query(QueryRegistry.FETCH_SIGNATURES_ONLY_BY_ID, [id]);
        return { ok: true, value: result.rows[0]?.signature ?? null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), id } };
    }
}
export async function fetchSignaturesOnlyBySignature(signature) {
    try {
        const result = await this.db.query(QueryRegistry.FETCH_SIGNATURES_ONLY_BY_SIGNATURE, [signature]);
        return { ok: true, value: result.rows[0]?.signatures ?? null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature } };
    }
}
export async function fetchSignaturesOnlyByLimit(params) {
    return isTruthyBool(params?.latest)
        ? this.fetchSignaturesOnlyByLimitLatest(params.limit)
        : this.fetchSignaturesOnlyByLimitOldest(params.limit);
}
export async function fetchSignaturesOnlyByLimitOldest(limit) {
    try {
        const result = await this.db.query(QueryRegistry.FETCH_SIGNATURES_ONLY_BY_LIMIT, [limit ?? 0]);
        return { ok: true, value: result.rows[0]?.signatures ?? null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), limit } };
    }
}
export async function fetchSignaturesOnlyByLimitLatest(limit) {
    try {
        const result = await this.db.query(QueryRegistry.FETCH_SIGNATURES_ONLY_BY_LIMIT_LATEST, [limit ?? 0]);
        return { ok: true, value: result.rows[0]?.signatures ?? null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), limit } };
    }
}
