import type { LogDataRepository } from "./../LogDataRepository.js";
import { QueryRegistry } from "./../../query-registry.js";
import type { IdLike, SigLike, RepoResult } from '@imports';
import { isId, isSignature, isSignatures, isIds } from '@imports';

export async function markSorted(
  this: LogDataRepository,
  params: {
    id?: IdLike;
    signature?: SigLike;
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
  }
): Promise<RepoResult<IdLike>> {
  const { meta_id, pair_id, txn_id } = params;

  if (isId(params.id)) {
    const result = await this.markSortedById({ id: params.id, meta_id, pair_id, txn_id });
    if (result.ok && result.value != null) return result;
  }
  if (isSignature(params.signature)) {
    const result = await this.markSortedBySignature({ signature: params.signature, meta_id, pair_id, txn_id });
    if (result.ok && result.value != null) return result;
  }
  return { ok: false, value: null, reason: "no_valid_lookup_key" };
}

export async function markSortedById(
  this: LogDataRepository,
  params: { id: IdLike; meta_id?: IdLike; pair_id?: IdLike; txn_id?: IdLike }
): Promise<RepoResult<IdLike>> {
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_SORTED_BY_ID,
      [params.id, params.meta_id ?? null, params.pair_id ?? null, params.txn_id ?? null]
    );
    const value = result.rows[0]?.id ?? null;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), id: params.id } };
  }
}

export async function markSortedBySignature(
  this: LogDataRepository,
  params: { signature: SigLike; meta_id?: IdLike; pair_id?: IdLike; txn_id?: IdLike }
): Promise<RepoResult<IdLike>> {
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_SORTED_BY_SIGNATURE,
      [params.signature, params.meta_id ?? null, params.pair_id ?? null, params.txn_id ?? null]
    );
    const value = result.rows[0]?.id ?? null;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature: params.signature } };
  }
}

export async function markSortedBatch(
  this: LogDataRepository,
  params: {
    ids?: IdLike[];
    signatures?: SigLike[];
    meta_id?: IdLike;
    pair_id?: IdLike;
    txn_id?: IdLike;
  }
): Promise<RepoResult<IdLike[]>> {
  const { meta_id, pair_id, txn_id } = params;
  const collected: IdLike[] = [];

  if (isIds(params.ids)) {
    const result = await this.markSortedBatchByIds({ ids: params.ids, meta_id, pair_id, txn_id });
    if (!result.ok) return result;
    collected.push(...(result.value ?? []));
  }

  if (isSignatures(params.signatures)) {
    const result = await this.markSortedBatchBySignatures({ signatures: params.signatures, meta_id, pair_id, txn_id });
    if (!result.ok) return result;
    collected.push(...(result.value ?? []));
  }

  return { ok: true, value: collected };
}

export async function markSortedBatchByIds(
  this: LogDataRepository,
  params: { ids: IdLike[]; meta_id?: IdLike; pair_id?: IdLike; txn_id?: IdLike }
): Promise<RepoResult<IdLike[]>> {
  if (!params.ids.length) return { ok: true, value: [] };
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_SORTED_BATCH_BY_ID,
      [params.ids, params.meta_id ?? null, params.pair_id ?? null, params.txn_id ?? null]
    );
    return { ok: true, value: result.rows.map(r => r.id) };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), count: params.ids.length } };
  }
}

export async function markSortedBatchBySignatures(
  this: LogDataRepository,
  params: { signatures: SigLike[]; meta_id?: IdLike; pair_id?: IdLike; txn_id?: IdLike }
): Promise<RepoResult<IdLike[]>> {
  if (!params.signatures.length) return { ok: true, value: [] };
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_SORTED_BATCH_BY_SIGNATURE,
      [params.signatures, params.meta_id ?? null, params.pair_id ?? null, params.txn_id ?? null]
    );
    return { ok: true, value: result.rows.map(r => r.id) };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), count: params.signatures.length } };
  }
}