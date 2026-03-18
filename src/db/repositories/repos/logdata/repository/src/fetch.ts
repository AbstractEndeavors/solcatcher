import type { LogDataRepository } from "./../LogDataRepository.js";
import { QueryRegistry } from "./../../query-registry.js";
import type {
  LogDataRow, IdLike, SigLike, LimitLike,
  LogPayloadContext, RepoResult
} from '@imports';
import { isId, isSignature, normalizeFetchByLimitInput, normalizeLimit } from '@imports';

export async function fetch(
  this: LogDataRepository,
  params: { id?: IdLike; signature?: SigLike }
): Promise<RepoResult<LogDataRow>> {
  if (isId(params.id)) {
    const result = await this.fetchById(params.id);
    // propagate found OR db_error — only skip on not_found to try next key
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isSignature(params.signature)) {
    const result = await this.fetchBySignature(params.signature);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  // only reaches here if no valid key was provided at all
  if (!isId(params.id) && !isSignature(params.signature)) {
    return { ok: false, reason: 'invalid_fetch_params', meta: { params } };
  }
  return { ok: false, reason: 'not_found', meta: { params } };
}
export async function fetchMany(
  this: LogDataRepository,
  params: { limit?: LimitLike; latest?: boolean }
): Promise<RepoResult<LogDataRow[]>> {
  const { limit, latest } = normalizeFetchByLimitInput(params);
  return latest
    ? this.fetchByLimitLatest(limit)
    : this.fetchByLimitOldest(limit);
}

export async function fetchByLimit(
  this: LogDataRepository,
  a?: unknown,
  b?: unknown
): Promise<RepoResult<LogDataRow[]>> {
  const params = a && typeof a === "object" ? a : { limit: a, latest: b };
  const { limit, latest } = normalizeFetchByLimitInput(params);
  return latest
    ? this.fetchByLimitLatest(limit)
    : this.fetchByLimitOldest(limit);
}

export async function fetchByLimitOldest(
  this: LogDataRepository,
  limit?: LimitLike
): Promise<RepoResult<LogDataRow[]>> {
  try {
    const lim = normalizeLimit(limit);
    const result = await this.db.query<LogDataRow>(
      lim != null ? QueryRegistry.FETCH_BY_LIMIT_OLDEST : QueryRegistry.FETCH_OLDEST_NO_LIMIT,
      lim != null ? [lim] : []
    );
    return { ok: true, value: result.rows.map(r => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), limit } };
  }
}

export async function fetchByLimitLatest(
  this: LogDataRepository,
  limit?: LimitLike
): Promise<RepoResult<LogDataRow[]>> {
  try {
    const lim = normalizeLimit(limit);
    const result = await this.db.query<LogDataRow>(
      lim != null ? QueryRegistry.FETCH_BY_LIMIT_LATEST : QueryRegistry.FETCH_LATEST_NO_LIMIT,
      lim != null ? [lim] : []
    );
    return { ok: true, value: result.rows.map(r => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), limit } };
  }
}

export async function fetchById(
  this: LogDataRepository,
  id: IdLike
): Promise<RepoResult<LogDataRow>> {
  if (!isId(id)) {
    return { ok: false, reason: 'invalid_id', meta: { id } };
  }
  try {
    const result = await this.db.query<LogDataRow>(QueryRegistry.FETCH_BY_ID, [Number(id)]);
    const row = result.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { id } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), id } };
  }
}

export async function fetchBySignature(
  this: LogDataRepository,
  signature: SigLike
): Promise<RepoResult<LogDataRow>> {
  if (!isSignature(signature)) {
    return { ok: false, reason: 'invalid_signature', meta: { signature } };
  }
  try {
    const result = await this.db.query<LogDataRow>(QueryRegistry.FETCH_BY_SIGNATURE, [signature]);
    const row = result.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { signature } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), signature } };
  }
}

export async function getContext(
  this: LogDataRepository,
  signature: SigLike
): Promise<RepoResult<LogPayloadContext>> {
  if (!isSignature(signature)) {
    return { ok: false, reason: 'invalid_signature', meta: { signature } };
  }
  try {
    const result = await this.db.query<LogPayloadContext>(QueryRegistry.GET_CONTEXT, [signature]);
    const row = result.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { signature } };
    return { ok: true, value: row };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), signature } };
  }
}