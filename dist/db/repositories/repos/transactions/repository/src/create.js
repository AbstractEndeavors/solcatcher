// ─────────────────────────────────────────────
// SCHEMA (idempotent DDL)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import { TransactionsRepository } from './../TransactionsRepository.js';
export async function createTable() {
    await this.db.query(QueryRegistry.CREATE_TABLE);
}
export async function createIndexes() {
    for (const ddl of QueryRegistry.CORE_INDEXES) {
        await this.db.query(ddl);
    }
}
export async function createPotentialIndexes() {
    for (const ddl of QueryRegistry.POTENTIAL_INDEXES) {
        await this.db.query(ddl);
    }
}
export async function createRollupsTable() {
    await this.db.query(QueryRegistry.CREATE_PAIR_ROLLUPS_TABLE);
}
export async function createTmpCreatorTable() {
    await this.db.query(QueryRegistry.CREATE_TMP_CREATOR_TABLE);
}
export async function initSchema() {
    await this.createTable();
    await this.createIndexes();
    await this.createRollupsTable();
}
