/**
 * SIGNATURES REPOSITORY
 *
 * Repository for account signature tracking.
 * Manages signature history and processing cursors.
 *
 * Pattern: Explicit operations over generic abstractions
 */
import { QueryRegistry, SignaturesRow } from './imports.js';
export class SignaturesRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async createTable() {
        await this.db.query(QueryRegistry.CREATE_TABLE);
        for (const indexQuery of QueryRegistry.CREATE_INDEXES) {
            await this.db.query(indexQuery);
        }
    } // ─────
    rowToModel(row) {
        return new SignaturesRow(row.account, row.signatures, row.processed_until, row.discovery_complete, row.created_at, row.updated_at);
    }
    async fetchByAccount(account) {
        const result = await this.db.query(QueryRegistry.FETCH_BY_ACCOUNT, [account]);
        const row = result.rows[0];
        return row ? this.rowToModel(row) : null;
    }
    async upsert(params) {
        await this.db.query(QueryRegistry.UPSERT_SIGNATURES, [params.account, JSON.stringify(params.signatures)]);
    }
    async verifyInsert(account) {
        const result = await this.db.query(QueryRegistry.VERIFY_INSERT, [account]);
        return result.rows[0]?.signatures ?? [];
    }
    async markDiscoveryComplete(account) {
        await this.db.query(QueryRegistry.UPDATE_DISCOVERY_COMPLETE, [account]);
    }
    async markDiscoveryInComplete(account) {
        await this.db.query(QueryRegistry.UPDATE_DISCOVERY_INCOMPLETE, [account]);
    }
    async ensureAccount(account) {
        await this.db.query(QueryRegistry.ENSURE_ACCOUNT, [account]);
    }
    async updateProcessedUntil(params) {
        await this.db.query(QueryRegistry.UPDATE_PROCESSED_UNTIL, [params.account, params.signature]);
    }
}
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================
export function createSignaturesRepository(db) {
    return new SignaturesRepository(db);
}
