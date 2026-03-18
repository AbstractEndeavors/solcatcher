import { MetaDataRepository } from './../MetaDataRepository.js';
import {QueryRegistry} from './../../query-registry.js';
import type  {IdLike,AddressLike,InsertGenesisParams,MintLike} from '@imports';
import {firstRowIdOrNull} from '@imports';

export async function insertStub(
  this:MetaDataRepository,
  mint: MintLike, 
  program_id: AddressLike
): Promise<IdLike> {
  if (!program_id) {
    throw new Error(`insertStub(): program_id required (mint=${mint})`);
  }

  const res = await this.db.query<{ id: IdLike }>(
    QueryRegistry.INSERT_STUB,
    [mint, program_id]
  );

  // Happy path
  if (res.rows[0]?.id) {
    return firstRowIdOrNull(res);
  }

  // Conflict → fetch existing
  const existing = await this.fetchByMint(mint);
  if (!existing) {
    throw new Error('insertStub(): invariant violation');
  }

  return firstRowIdOrNull(res);;
}

  // ─────────────────────────────────────────────
  // INSERT - Genesis (upsert)
  // ─────────────────────────────────────────────

export async function insertGenesis(
  this:MetaDataRepository,
  params: InsertGenesisParams
): Promise<IdLike> {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.INSERT_GENESIS,
      [
        params.mint,
        params.name ?? null,
        params.symbol ?? null,
        params.uri ?? null,
        params.discriminator ?? null,
        params.user_address ?? null,
        params.creator ?? null,
        params.signature ?? null,
        params.bonding_curve ?? null,
        params.associated_bonding_curve ?? null,
        params.program_id ?? null,
        params.timestamp ?? null
      ]
    );

    return firstRowIdOrNull(res);
  }
