import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike, PairIdentityParams, IdentityEnrichParams, PairRow, RepoResult } from '@imports';
import { derivePairEnrichTypes,firstRowIdOrNull } from '@imports';
import { SOLANA_PUMP_FUN_PROGRAM_ID as program_id } from '@imports';
function errResult(reason: string, meta?: Record<string, unknown>): RepoResult<never> {
  return { ok: false, reason, ...(meta ? { meta } : {}) };
}

export async function insertIdentity(
  this: PairsRepository,
  params: PairIdentityParams
): Promise<RepoResult<IdLike>> {
  try {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.INSERT_IDENTITY,
      [params.mint, params.program_id ?? program_id]
    );

    const id = firstRowIdOrNull(res);
    if (id) return { ok: true, value: id };

    // conflict path → re-resolve through fetch()
    const existing = await this.fetch({ mint: params.mint });
    if (existing.ok && existing.value) {
      return { ok: true, value: existing.value.id };
    }

    return {
      ok: false,
      reason: 'invariant_violation',
      meta: { params }
    };
  } catch (err) {
    return {
      ok: false,
      reason: 'db_error',
      meta: { err: String(err), params }
    };
  }
}

export async function assureIdentity(
  this: PairsRepository,
  params: PairIdentityParams
): Promise<RepoResult<IdLike>> {
  const existing = await this.fetch({ mint: params.mint });

  if (existing.ok && existing.value) {
    return { ok: true, value: existing.value.id };
  }

  if (!existing.ok && existing.reason !== 'not_found') {
    return errResult(existing.reason, existing.meta);
  }
  return this.insertIdentity(params);
}



export async function assureIdentityEnrich(
  this: PairsRepository,
  params: PairIdentityParams
): Promise<RepoResult<IdentityEnrichParams<PairRow>>> {

  const fetched = await this.fetch({ mint: params.mint });

  if (!fetched.ok && fetched.reason !== 'not_found') {
    return errResult(fetched.reason, fetched.meta);
  }

  if (fetched.ok && fetched.value) {
    const row = fetched.value;
    const enrichType = derivePairEnrichTypes(row);
    return {
      ok: true,
      value: { id: row.id, needsEnrich: enrichType.length > 0, enrichType, row }
    };
  }

  const inserted = await this.insertIdentity(params);
  if (!inserted.ok || inserted.value == null) {
    return errResult(inserted.reason ?? 'insert_failed', inserted.meta);
  }

  const refetch = await this.fetch({ mint: params.mint });
  if (!refetch.ok || !refetch.value) {
    return errResult('invariant_violation', { params });
  }

  const enrichType = derivePairEnrichTypes(refetch.value);
  return {
    ok: true,
    value: { id: refetch.value.id, needsEnrich: enrichType.length > 0, enrichType, row: refetch.value }
  };
}

export async function updateStatus(
  this: PairsRepository,
  pairId: IdLike,
  status: string
): Promise<RepoResult<IdLike>> {
  try {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.UPDATE_STATUS,
      [pairId, status]
    );
    return { ok: true, value: res.rows[0]?.id ?? null };
  } catch (err) {
    return {
      ok: false,
      reason: 'db_error',
      meta: { err: String(err), pairId }
    };
  }
}