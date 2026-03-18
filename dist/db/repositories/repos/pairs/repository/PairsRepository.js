import { QueryRegistry } from './../query-registry.js';
import { PairRow, ensureStringOptional } from '@imports';
import { SOLANA_PUMP_FUN_PROGRAM_ID as program_id } from '@imports';
import { bindRepo } from '@imports';
import * as src from './src/index.js';
export class PairsRepository {
    db;
    constructor(db) {
        this.db = db;
        bindRepo(this, { src });
    }
    async executeIndexCreation() {
        const indexes = [...QueryRegistry.CREATE_INDEXES];
        await Promise.all(indexes.map(sql => this.db.query(sql)));
    }
    async createTable() {
        await this.db.query(QueryRegistry.CREATE_TABLE);
        // Add type assertion for the array iteration
        for (const q of QueryRegistry.CREATE_INDEXES) {
            await this.db.query(q);
        }
    }
    // Generic fetch method - DRY
    async fetchOne(queryKey, param) {
        const res = await this.db.query(QueryRegistry[queryKey], [param]);
        const row = res.rows[0];
        return row ? this.rowToModel(row) : null;
    }
    rowToModel(row) {
        return new PairRow(row.id, row.mint, row.program_id || program_id, row.token_program, row.bonding_curve, row.associated_bonding_curve, row.creator, row.signature, row.metaplex, ensureStringOptional(row.virtual_token_reserves) || null, ensureStringOptional(row.virtual_sol_reserves) || null, ensureStringOptional(row.real_token_reserves) || null, ensureStringOptional(row.token_total_supply) || null, row.log_id, row.txn_id, row.meta_id, row.tcns, row.slot, row.timestamp, row.created_at, row.updated_at, row.processed_at);
    }
    // In PairsRepository or PairsService
    async fetchBatchByMints(mints) {
        if (!mints.length)
            return [];
        const result = await this.db.query(`SELECT * FROM pairs WHERE mint = ANY($1)`, [mints]);
        return result.rows.map(row => this.rowToModel(row));
    }
}
export function createPairsRepository(db) {
    return new PairsRepository(db);
}
