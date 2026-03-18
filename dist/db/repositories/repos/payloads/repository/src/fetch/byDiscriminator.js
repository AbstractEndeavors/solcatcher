import { LogPayloadRepository, QueryRegistry, normalizeFetchByDiscriminatorInput, normalizeLimit } from './imports.js';
export async function fetchByDiscriminator(a, b, c) {
    const { discriminator, limit, latest } = normalizeFetchByDiscriminatorInput(a, b, c);
    return latest
        ? this.fetchByDiscriminatorLatest(discriminator, limit)
        : this.fetchByDiscriminatorOldest(discriminator, limit);
}
export async function fetchByDiscriminatorOldest(discriminator, limit) {
    const lim = normalizeLimit(limit);
    const result = await this.db.query(lim != null
        ? QueryRegistry.FETCH_BY_DISCRIMINATOR_OLDEST
        : QueryRegistry.FETCH_BY_DISCRIMINATOR_OLDEST_NO_LIMIT, lim != null ? [discriminator, lim] : [discriminator]);
    return result.rows.map(r => this.rowToModel(r));
}
export async function fetchByDiscriminatorLatest(discriminator, limit) {
    const lim = normalizeLimit(limit);
    const result = await this.db.query(lim != null
        ? QueryRegistry.FETCH_BY_DISCRIMINATOR_LATEST
        : QueryRegistry.FETCH_BY_DISCRIMINATOR_LATEST_NO_LIMIT, lim != null ? [discriminator, lim] : [discriminator,]);
    return result.rows.map((r) => this.rowToModel(r));
}
