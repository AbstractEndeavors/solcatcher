// ──────────────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────────────
import { LogPayloadRepository, QueryRegistry } from './imports.js';
export async function fetchDiscriminatorEvents() {
    const result = await this.db.query(QueryRegistry.FETCH_DISCRIMINATOR_EVENTS);
    const map = new Map();
    for (const row of result.rows) {
        map.set(row.discriminator, row.events);
    }
    return map;
}
export async function fetchDiscriminatorVersions() {
    const result = await this.db.query(QueryRegistry.FETCH_DISCRIMINATOR_VERSIONS);
    const map = new Map();
    for (const row of result.rows) {
        map.set(row.discriminator, Number(row.versions));
    }
    return map;
}
export async function fetchDiscriminatorProgramFrequency() {
    const result = await this.db.query(QueryRegistry.FETCH_DISCRIMINATOR_PROGRAM_FREQUENCY);
    const map = new Map();
    for (const row of result.rows) {
        if (!map.has(row.discriminator)) {
            map.set(row.discriminator, new Map());
        }
        map.get(row.discriminator).set(row.program_id, Number(row.seen));
    }
    return map;
}
export async function countByProgram() {
    const result = await this.db.query(QueryRegistry.COUNT_BY_PROGRAM);
    const map = new Map();
    for (const row of result.rows) {
        map.set(row.program_id, Number(row.count));
    }
    return map;
}
export async function countUnprocessed() {
    const result = await this.db.query(QueryRegistry.COUNT_UNPROCESSED);
    return Number(result.rows[0]?.count ?? 0);
}
