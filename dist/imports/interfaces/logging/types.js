import { logger } from './../../module_imports.js';
export function withCtx(base, extra) {
    return { ...base, ...(extra ?? {}) };
}
export function redacted(o, fields = []) {
    const clone = { ...o };
    for (const f of fields)
        if (f in clone)
            clone[f] = '[redacted]';
    return clone;
}
export class InstrumentedClient {
    inner;
    constructor(inner) {
        this.inner = inner;
    }
    async query(text, params, meta) {
        const start = performance.now();
        try {
            const res = await this.inner.query(text, params);
            const ms = +(performance.now() - start).toFixed(1);
            logger.info(withCtx({ op: meta?.op ?? 'db.query', queryKey: meta?.queryKey, signature: meta?.signature, rows: res.rowCount ?? res.rows.length, ms }, {}), 'DB query ok');
            return res;
        }
        catch (err) {
            const ms = +(performance.now() - start).toFixed(1);
            logger.error(withCtx({ op: meta?.op ?? 'db.query', queryKey: meta?.queryKey, signature: meta?.signature, ms, error: err?.message, code: err?.code }, {}), 'DB query error');
            throw err;
        }
    }
}
