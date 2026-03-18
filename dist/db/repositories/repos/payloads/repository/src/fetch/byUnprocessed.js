import { LogPayloadRepository, QueryRegistry, normalizeFetchByLimitInput, normalizeLimit } from './imports.js';
import {} from './imports.js';
export async function fetchByUnprocessed(a, b) {
    const { limit, latest } = normalizeFetchByLimitInput(a, b);
    return latest
        ? this.fetchByUnprocessedLatest(limit)
        : this.fetchByUnprocessedOldest(limit);
}
export async function fetchByUnprocessedOldest(limit) {
    const lim = normalizeLimit(limit);
    const result = await this.db.query(lim != null
        ? QueryRegistry.FETCH_UNPROCESSED_OLDEST
        : QueryRegistry.FETCH_UNPROCESSED_OLDEST_NO_LIMIT, lim != null ? [lim] : []);
    return result.rows.map(r => this.rowToModel(r));
}
export async function fetchByUnprocessedLatest(limit) {
    const lim = normalizeLimit(limit);
    const result = await this.db.query(lim != null
        ? QueryRegistry.FETCH_UNPROCESSED_LATEST
        : QueryRegistry.FETCH_UNPROCESSED_LATEST_NO_LIMIT, lim != null ? [lim] : []);
    return result.rows.map(r => this.rowToModel(r));
}
