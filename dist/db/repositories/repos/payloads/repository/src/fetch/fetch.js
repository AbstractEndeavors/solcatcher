import { isTruthyBool, isString, isSignature, isId, isLimit, LogPayloadRepository, QueryRegistry, } from './imports.js';
export async function fetch(params) {
    const { id, signature, discriminator, limit, latest, unprocessed } = params;
    if (isId(id)) {
        const row = await this.fetchById(id);
        return row ? [row] : [];
    }
    if (isSignature(signature)) {
        return await this.fetchBySignature(signature);
    }
    if (isTruthyBool(unprocessed)) {
        return await this.fetchByUnprocessed({ limit, latest });
    }
    if (isString(discriminator, 'discriminator')) {
        return await this.fetchByDiscriminator({ discriminator, limit, latest });
    }
    if (isLimit(limit)) {
        return await this.fetchByLimit({ limit, latest });
    }
    return [];
}
export async function fetchById(id) {
    const result = await this.db.query(QueryRegistry.FETCH_BY_ID, [id]);
    const row = result.rows[0];
    return row ? this.rowToModel(row) : null;
}
export async function fetchByIds(ids) {
    if (!ids.length)
        return [];
    // normalize + dedupe defensively
    const uniqueIds = [...new Set(ids.map(Number))].filter(n => Number.isInteger(n) && n > 0);
    if (!uniqueIds.length)
        return [];
    const result = await this.db.query(QueryRegistry.FETCH_BY_IDS, [uniqueIds]);
    return result.rows.map(row => this.rowToModel(row));
}
export async function fetchBySignature(signature) {
    const result = await this.db.query(QueryRegistry.FETCH_BY_SIGNATURE, [signature]);
    return result.rows.map(row => this.rowToModel(row));
}
