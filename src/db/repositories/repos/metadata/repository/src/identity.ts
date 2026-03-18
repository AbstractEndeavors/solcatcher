import { MetaDataRepository } from './../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike, MintLike,Identity, AddressLike, IdentityEnrichParams, MetaDataRow, RepoResult } from '@imports';
import { firstRowIdOrNull } from '@imports';
import { deriveMetaDataEnrichTypes } from '@imports';
// identity.ts

function errResult(reason: string, meta?: Record<string, unknown>): RepoResult<never> {
  return { ok: false, reason, ...(meta ? { meta } : {}) };
}

export async function insertIdentity(
  this: MetaDataRepository,
  params: Identity
): Promise<RepoResult<IdLike>> {
  try {
    const res = await this.db.query<{ id: IdLike }>(
      QueryRegistry.INSERT_IDENTITY,
      [params.mint, params.program_id]
    );

    const id = firstRowIdOrNull(res);
    if (id) return { ok: true, value: id };

    // conflict path → re-resolve through fetch()
    const existing = await this.fetch(params);
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
  this: MetaDataRepository,
  params: Identity
): Promise<RepoResult<IdLike>> {
  const existing = await this.fetch(params);

  if (existing.ok && existing.value) {
    return { ok: true, value: existing.value.id };
  }

  if (!existing.ok && existing.reason !== 'not_found') {
    return errResult(existing.reason, existing.meta);
  }
  return this.insertIdentity(params);
}



export async function assureIdentityEnrich(
  this: MetaDataRepository,
  params: Identity
): Promise<RepoResult<IdentityEnrichParams<MetaDataRow>>> {

  const fetched = await this.fetch(params);

  if (!fetched.ok && fetched.reason !== 'not_found') {
    return errResult(fetched.reason, fetched.meta);
  }

  if (fetched.ok && fetched.value) {
    const row = fetched.value;
    const enrichType = deriveMetaDataEnrichTypes(row);
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

  const enrichType = deriveMetaDataEnrichTypes(refetch.value);
  return {
    ok: true,
    value: { id: refetch.value.id, needsEnrich: enrichType.length > 0, enrichType, row: refetch.value }
  };
}