  // ─────────────────────────────────────────────
  // INSERT (idempotent by signature)
  // ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import {TransactionsRepository} from './../TransactionsRepository.js';
import type {IdLike,TransactionsInsertParams} from '@imports';

  export async function insertAndReturnId(
  this: TransactionsRepository,
  params: TransactionsInsertParams
): Promise<IdLike | null> {
  const res = await this.db.query<{ id: IdLike }>(
    QueryRegistry.INSERT_TRANSACTION,
    [
      params.log_id,
      params.pair_id,
      params.meta_id,
      params.signature,
      params.program_id,
      params.slot,
      params.invocation,
      params.mint,
      params.user_address,
      params.is_buy,
      params.ix_name,
      params.sol_amount,
      params.token_amount,
      params.virtual_sol_reserves,
      params.virtual_token_reserves,
      params.real_sol_reserves,
      params.real_token_reserves,
      params.mayhem_mode,
      params.price,
      params.track_volume,
      params.total_unclaimed_tokens,
      params.total_claimed_tokens,
      params.current_sol_volume,
      params.fee_recipient,
      params.fee_basis_points,
      params.fee,
      params.creator,
      params.creator_fee_basis_points,
      params.creator_fee,
      params.timestamp,
      params.last_update_timestamp,
    ]
  );

  return res.rows[0]?.id ?? null;
}
  export async function insert(
    this: TransactionsRepository,
    params: TransactionsInsertParams
  ): Promise<IdLike> {
    
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.INSERT_TRANSACTION,
      [
        params.log_id,
        params.pair_id,
        params.meta_id,
        params.signature,
        params.program_id,
        params.slot,
        params.invocation,
        params.mint,
        params.user_address,
        params.is_buy,
        params.ix_name,
        params.sol_amount,
        params.token_amount,
        params.virtual_sol_reserves,
        params.virtual_token_reserves,
        params.real_sol_reserves,
        params.real_token_reserves,
        params.mayhem_mode,
        params.price,
        params.track_volume,
        params.total_unclaimed_tokens,
        params.total_claimed_tokens,
        params.current_sol_volume,
        params.fee_recipient,
        params.fee_basis_points,
        params.fee,
        params.creator,
        params.creator_fee_basis_points,
        params.creator_fee,
        params.timestamp,
        params.last_update_timestamp,
      ]
    );

    const id = result.rows[0]?.id;
    if (!id) {
      throw new Error("TransactionsRepository.insert(): no id returned (conflict?)");
    }

    return id;
  }

  /**
   * Insert if not exists, return existing id if conflict.
   * Avoids the round-trip check pattern.
   */
  export async function insertOrIgnore(
    this: TransactionsRepository,
    params: TransactionsInsertParams
  ): Promise<IdLike | null> {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.INSERT_TRANSACTION,
      [
        params.log_id,
        params.pair_id,
        params.meta_id,
        params.signature,
        params.program_id,
        params.slot,
        params.invocation,
        params.mint,
        params.user_address,
        params.is_buy,
        params.ix_name,
        params.sol_amount,
        params.token_amount,
        params.virtual_sol_reserves,
        params.virtual_token_reserves,
        params.real_sol_reserves,
        params.real_token_reserves,
        params.mayhem_mode,
        params.price,
        params.track_volume,
        params.total_unclaimed_tokens,
        params.total_claimed_tokens,
        params.current_sol_volume,
        params.fee_recipient,
        params.fee_basis_points,
        params.fee,
        params.creator,
        params.creator_fee_basis_points,
        params.creator_fee,
        params.timestamp,
        params.last_update_timestamp,
      ]
    );

    // ON CONFLICT DO NOTHING → no row returned
    return result.rows[0]?.id ?? null;
  }
