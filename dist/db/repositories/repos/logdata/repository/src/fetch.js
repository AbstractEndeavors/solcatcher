import { QueryRegistry } from "./../../query-registry.js";
import { isLimit, isId, isSignature, normalizeFetchByLimitInput, normalizeLimit } from '@imports';
export async function fetch(params) {
    if (isId(params.id)) {
        return this.fetchById(params.id);
    }
    if (isSignature(params.signature)) {
        return this.fetchBySignature(params.signature);
    }
    return { ok: true, value: null };
}
export async function fetchMany(params) {
    return this.fetchByLimit(params.limit, params.latest);
}
export async function fetchByLimit(a, b) {
    const params = a && typeof a === "object" ? a : { limit: a, latest: b };
    const { limit, latest } = normalizeFetchByLimitInput(params);
    return latest
        ? this.fetchByLimitLatest(limit)
        : this.fetchByLimitOldest(limit);
}
export async function fetchByLimitOldest(limit) {
    try {
        const lim = normalizeLimit(limit);
        const result = await this.db.query(lim != null ? QueryRegistry.FETCH_BY_LIMIT_OLDEST : QueryRegistry.FETCH_OLDEST_NO_LIMIT, lim != null ? [lim] : []);
        return { ok: true, value: result.rows.map(r => this.rowToModel(r)) };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), limit } };
    }
}
export async function fetchByLimitLatest(limit) {
    try {
        const lim = normalizeLimit(limit);
        const result = await this.db.query(lim != null ? QueryRegistry.FETCH_BY_LIMIT_LATEST : QueryRegistry.FETCH_LATEST_NO_LIMIT, lim != null ? [lim] : []);
        return { ok: true, value: result.rows.map(r => this.rowToModel(r)) };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), limit } };
    }
}
export async function fetchById(id) {
    if (Array.isArray(id)) {
        return { ok: false, value: null, reason: "invalid_id_array", meta: { id } };
    }
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId < 1) {
        return { ok: false, value: null, reason: "invalid_id", meta: { id } };
    }
    try {
        const result = await this.db.query(QueryRegistry.FETCH_BY_ID, [numId]);
        const row = result.rows[0];
        return { ok: true, value: row ? this.rowToModel(row) : null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), id } };
    }
}
export async function fetchBySignature(signature) {
    try {
        const result = await this.db.query(QueryRegistry.FETCH_BY_SIGNATURE, [signature]);
        const row = result.rows[0];
        return { ok: true, value: row ? this.rowToModel(row) : null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature } };
    }
}
export async function getContext(signature) {
    try {
        const result = await this.db.query(QueryRegistry.GET_CONTEXT, [signature]);
        const row = result.rows[0];
        return { ok: true, value: row ?? null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature } };
    }
}
