// src/db/repositories/repos/pairs/repository/PairsRepository.ts
import type { DatabaseClient } from './../../types.js';
import { QueryRegistry } from './../query-registry.js';
import {PairRow,ensureStringOptional} from '@imports'
import {SOLANA_PUMP_FUN_PROGRAM_ID as program_id} from '@imports';
import {bindRepo} from '@imports';
import * as src from './src/index.js';
// Define which queries are valid for fetching
type FetchQueryKey = 
  | 'FETCH_BY_ID'
  | 'FETCH_BY_MINT'
  | 'FETCH_BY_BONDING_CURVE'
  | 'FETCH_BY_PROGRAM'
  | 'FETCH_BY_MINT_AND_PROGRAM'
  | 'FETCH_BY_ASSOCIATED_BONDING_CURVE'
  | 'FETCH_BY_SIGNATURE'  // Only uppercase
  | 'FETCH_STUBS'
  | 'FETCH_CURSOR_INITIAL'
  | 'FETCH_CURSOR';

export type PairsRepositoryBindings = & typeof src
export interface PairsRepository extends PairsRepositoryBindings {}
export class PairsRepository {
  constructor(readonly db: DatabaseClient) {
        bindRepo(this, {src});
    }
private async executeIndexCreation(): Promise<void> {
  const indexes: string[] = [...QueryRegistry.CREATE_INDEXES];
  await Promise.all(indexes.map(sql => this.db.query(sql)));
}
async createTable(): Promise<void> {
  await this.db.query(QueryRegistry.CREATE_TABLE);
  // Add type assertion for the array iteration
  for (const q of QueryRegistry.CREATE_INDEXES as readonly string[]) {
    await this.db.query(q);
  }
}

// Generic fetch method - DRY
async fetchOne(queryKey: FetchQueryKey, param: any): Promise<PairRow | null> {
  const res = await this.db.query(QueryRegistry[queryKey], [param]);
  const row = res.rows[0];
  return row ? this.rowToModel(row) : null;
}
  rowToModel(row: any): PairRow {
    return new PairRow(
    row.id,
    row.mint,
    row.program_id || program_id,
    row.token_program,
    row.bonding_curve,
    row.associated_bonding_curve,
    row.creator,
    row.signature,
    row.metaplex,
    ensureStringOptional(row.virtual_token_reserves) || null,
    ensureStringOptional(row.virtual_sol_reserves) || null,
    ensureStringOptional(row.real_token_reserves) || null,
    ensureStringOptional(row.token_total_supply) || null,
    row.log_id,
    row.txn_id,
    row.meta_id,
    row.tcns,
    row.slot,
    row.status,
    row.timestamp,
    row.last_fetch,
    row.created_at,
    row.updated_at,
    row.processed_at
    );
  }
// In PairsRepository or PairsService
async fetchBatchByMints(mints: string[]): Promise<PairRow[]> {
    if (!mints.length) return [];
    
    const result = await query<PairRow>(
        `SELECT * FROM pairs WHERE mint = ANY($1)`,
        [mints]
    );
    
    return result.rows.map(row => this.rowToModel(row));
}


}
export function createPairsRepository(db: DatabaseClient): PairsRepository {
  return new PairsRepository(db);
}
