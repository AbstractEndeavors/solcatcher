import { PairsRepository } from '../PairsRepository.js';
import {QueryRegistry} from './../../query-registry.js';
import type {IdLike,AddressLike,PairInsertData,MintLike} from '@imports';
import {ensureStringOptional,expectSingleRow,firstRowIdOrNull} from '@imports';
  // ─────────────────────────────────────────────
  // INSERT (GENESIS)
  // ─────────────────────────────────────────────

export async function insert(
  this:PairsRepository,
  params: PairInsertData
): Promise<IdLike | null> {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.INSERT_PAIR,
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
    
    return firstRowIdOrNull(res);
  }


