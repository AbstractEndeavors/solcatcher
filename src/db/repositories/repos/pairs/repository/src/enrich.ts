import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike, EnrichPairParams, RepoResult } from '@imports';

export async function enrich(
  this: PairsRepository,
  pairId: IdLike,
  params: EnrichPairParams
): Promise<RepoResult<IdLike>> {
  try {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.ENRICH_PAIR,
      [
        pairId,
        params.log_id ?? null,
        params.txn_id ?? null,
        params.meta_id ?? null,
        params.signature ?? null,
        params.associated_bonding_curve ?? null,
      ]
    );
    const value = res.rows[0]?.id ?? null;
    if (!value) return { ok: false, value: null, reason: 'enrich_returned_no_id', meta: { pairId } };
    return { ok: true, value };
  } catch (err) {
    return { ok: false, value: null, reason: 'db_error', meta: { err: String(err), pairId } };
  }
}

export async function markFetched(
  this: PairsRepository,
  id: IdLike
): Promise<void> {
  const res = await this.db.query<{ id: IdLike }>(
    QueryRegistry.MARK_FETCHED,
    [id]
  );
}
