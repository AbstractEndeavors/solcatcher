import { PairsRepository } from '../PairsRepository.js';
import {QueryRegistry} from './../../query-registry.js';
import type {IdLike,PairUpsertData,PairRow} from '@imports';
import {ensureStringOptional,firstRowIdOrNull,firstRowOrNull} from '@imports';
export async function updateChainTimestamp(
  this:PairsRepository,
  pairId: IdLike, 
  timestamp: Date
): Promise<IdLike> {
  const res = await this.db.query<{ id: IdLike }>(
    QueryRegistry.UPDATE_CHAIN_TIMESTAMP,
    [pairId, timestamp]
  );
  return firstRowIdOrNull(res);
}
export async function upsert(
  this: PairsRepository,
  params: PairUpsertData
): Promise<PairRow | null> {
  const res = await this.db.query<PairRow>(
    QueryRegistry.UPSERT_PAIR_FULL,
    [
      params.mint,
      params.program_id,
      params.token_program ?? null,
      params.bonding_curve ?? null,
      params.associated_bonding_curve ?? null,
      params.creator ?? null,
      params.signature ?? null,
      ensureStringOptional(params.virtual_token_reserves),
      ensureStringOptional(params.virtual_sol_reserves),
      ensureStringOptional(params.real_token_reserves),
      ensureStringOptional(params.token_total_supply),
      params.log_id ?? null,
      params.txn_id ?? null,
      params.meta_id ?? null,
      params.slot ?? null,
      params.timestamp ?? null,
    ]
  );
  return res.rows[0];
}