import { normalizeFetchByLimitInput, normalizeLimit, LogPayloadRepository, QueryRegistry } from './imports.js';
export async function fetchByLimit(a, b) {
    const { limit, latest } = normalizeFetchByLimitInput(a, b);
    return latest
        ? this.fetchByLimitLatest(limit)
        : this.fetchByLimitOldest(limit);
}
export async function fetchByLimitOldest(limit) {
    const lim = normalizeLimit(limit);
    const result = await this.db.query(lim != null
        ? QueryRegistry.FETCH_BY_LIMIT_OLDEST
        : QueryRegistry.FETCH_OLDEST_NO_LIMIT, lim != null ? [lim] : []);
    return result.rows.map(r => this.rowToModel(r));
}
export async function fetchByLimitLatest(limit) {
    const lim = normalizeLimit(limit);
    const result = await this.db.query(lim != null
        ? QueryRegistry.FETCH_BY_LIMIT_LATEST
        : QueryRegistry.FETCH_LATEST_NO_LIMIT, lim != null ? [lim] : []);
    return result.rows.map(r => this.rowToModel(r));
}
