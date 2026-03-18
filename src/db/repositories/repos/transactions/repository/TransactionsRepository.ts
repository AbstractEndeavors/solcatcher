import type { DatabaseClient,TransactionsInsertParams } from "@imports";
import { QueryRegistry } from "./../query-registry.js";
import { TransactionsRow } from "@imports";
import type {IdLike} from '@imports';
import {bindRepo} from '@imports';
import * as src from './src/index.js';

export type TransactionsRepositoryBindings =
  & typeof src;
export interface TransactionsRepository extends TransactionsRepositoryBindings {}
// ============================================================
// REPOSITORY
// ============================================================
export class TransactionsRepository {
  constructor(public readonly db: DatabaseClient) {    
    bindRepo(this, {
        src
        });
      }
  private rowToModel(row: any): TransactionsRow {
    return new TransactionsRow(
      row.id,
      row.log_id,
      row.pair_id,
      row.meta_id,

      row.signature,
      row.program_id,
      row.slot,
      row.invocation,

      row.mint,
      row.user_address,

      row.is_buy,
      row.ix_name,

      row.sol_amount,
      row.token_amount,

      row.virtual_sol_reserves,
      row.virtual_token_reserves,
      row.real_sol_reserves?.toString(),
      row.real_token_reserves?.toString(),

      row.mayhem_mode,
      row.price,

      row.track_volume,
      row.total_unclaimed_tokens?.toString(),
      row.total_claimed_tokens?.toString(),
      row.current_sol_volume?.toString(),

      row.fee_recipient,
      row.fee_basis_points?.toString(),
      row.fee,

      row.creator,
      row.creator_fee_basis_points?.toString(),
      row.creator_fee?.toString(),

      Number(row.timestamp),
      Number(row.last_update_timestamp),

      row.processed_at,
      row.created_at,
      row.updated_at,
    );

  }
public mapRow = (row: any): TransactionsRow => {
  return this.rowToModel(row);
};
  // add directly in the class
fetchByIds = async (ids: IdLike[]): Promise<TransactionsRow[]> => {
  if (!ids.length) return [];

  const res = await this.db.query(
    QueryRegistry.FETCH_BY_IDS,
    [ids]
  );

  return res.rows.map((r:any) => this.rowToModel(r));
};
// In TransactionsRepository
async insertBatch(txns: TransactionsInsertParams[]): Promise<number[]> {
    if (!txns.length) return [];
    
    const result = await this.db.query(`
        INSERT INTO transactions 
        (signature, pair_id, is_buy, sol_amount, token_amount, ...)
        SELECT * FROM json_to_recordset($1::json)
        AS t(signature TEXT, pair_id INT, is_buy BOOLEAN, ...)
        ON CONFLICT (signature) DO UPDATE SET ...
        RETURNING id
    `, [JSON.stringify(txns)]);
    
    return result.rows.map(r => r.id);
}
}

