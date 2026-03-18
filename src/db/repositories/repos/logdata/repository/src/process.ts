import type { LogDataRepository } from "./../LogDataRepository.js";
import { QueryRegistry } from "./../../query-registry.js";
import type { IdLike, SigLike, RepoResult } from '@imports';
import { isId, isSignature, isSignatures, isIds } from '@imports';

export async function markProcessed(
  this: LogDataRepository,
  params: { id?: IdLike; signature?: SigLike }
): Promise<RepoResult<IdLike>> {
  if (isId(params.id)) {
    const result = await this.markProcessedById(params.id);
    if (result.ok && result.value != null) return result;
  }
  if (isSignature(params.signature)) {
    const result = await this.markProcessedBySignature(params.signature);
    if (result.ok && result.value != null) return result;
  }
  return { ok: false, value: null, reason: "no_valid_lookup_key" };
}

export async function markProcessedById(
  this: LogDataRepository,
  id: IdLike
): Promise<RepoResult<IdLike>> {
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_PROCESSED_BY_ID,
      [id]
    );
    const value = result.rows[0]?.id ?? null;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), id } };
  }
}

export async function markProcessedBySignature(
  this: LogDataRepository,
  signature: SigLike
): Promise<RepoResult<IdLike>> {
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_PROCESSED_BY_SIGNATURE,
      [signature]
    );
    const value = result.rows[0]?.id ?? null;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), signature } };
  }
}

export async function markProcessedBatch(
  this: LogDataRepository,
  params: { ids?: IdLike[]; signatures?: SigLike[] }
): Promise<RepoResult<IdLike[]>> {
  const collected: IdLike[] = [];

  if (isIds(params.ids)) {
    const result = await this.markProcessedBatchByIds(params.ids);
    if (!result.ok) return result;
    collected.push(...(result.value ?? []));
  }

  if (isSignatures(params.signatures)) {
    const result = await this.markProcessedBatchBySignatures(params.signatures);
    if (!result.ok) return result;
    collected.push(...(result.value ?? []));
  }

  return { ok: true, value: collected };
}

export async function markProcessedBatchByIds(
  this: LogDataRepository,
  ids: IdLike[]
): Promise<RepoResult<IdLike[]>> {
  if (!ids.length) return { ok: true, value: [] };
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_PROCESSED_BATCH_BY_ID,
      [ids]
    );
    return { ok: true, value: result.rows.map(r => r.id) };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), count: ids.length } };
  }
}

export async function markProcessedBatchBySignatures(
  this: LogDataRepository,
  signatures: SigLike[]
): Promise<RepoResult<IdLike[]>> {
  if (!signatures.length) return { ok: true, value: [] };
  try {
    const result = await this.db.query<{ id: IdLike }>(
      QueryRegistry.MARK_PROCESSED_BATCH_BY_SIGNATURE,
      [signatures]
    );
    return { ok: true, value: result.rows.map(r => r.id) };
  } catch (err) {
    return { ok: false, value: null, reason: "db_error", meta: { err: String(err), count: signatures.length } };
  }
}