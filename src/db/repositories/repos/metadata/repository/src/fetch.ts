import { MetaDataRepository } from './../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike,  MetaDataRow,AddressLike,  MintLike, LimitLike, RepoResult,MetaDataIdentityParams } from '@imports';
import { isId, isMint, isAddress } from '@imports';
export async function fetch(
  this: MetaDataRepository,
  params: MetaDataIdentityParams
): Promise<RepoResult<MetaDataRow>> {
  if (isId(params.id)) {
    const result = await this.fetchById(params.id);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isMint(params.mint)) {
    const result = await this.fetchByMint(params.mint);
    if (result.ok || result.reason !== 'not_found') return result;
  }

  const hasValidKey = isId(params.id) || isMint(params.mint);

  return hasValidKey
    ? { ok: false, reason: 'not_found', meta: { params } }
    : { ok: false, reason: 'invalid_fetch_params', meta: { params } };
}

export async function fetchById(
  this: MetaDataRepository,
  id: IdLike
): Promise<RepoResult<MetaDataRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_ID, [id]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { id } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), id } };
  }
}

export async function fetchByMint(
  this: MetaDataRepository,
  mint: MintLike
): Promise<RepoResult<MetaDataRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_MINT, [mint]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { mint } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), mint } };
  }
}

export async function fetchByBondingCurve(
  this: MetaDataRepository,
  curve: AddressLike
): Promise<RepoResult<MetaDataRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_BONDING_CURVE, [curve]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { curve } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), curve } };
  }
}

export async function fetchByAssociatedBondingCurve(
  this: MetaDataRepository,
  curve: AddressLike
): Promise<RepoResult<MetaDataRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_ASSOCIATED_BONDING_CURVE, [curve]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { curve } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), curve } };
  }
}

export async function getIdByMint(
  this: MetaDataRepository,
  mint: MintLike
): Promise<RepoResult<IdLike>> {
  try {
    const res = await this.db.query<{ id: IdLike }>(QueryRegistry.GET_ID_BY_MINT, [mint]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { mint } };
    return { ok: true, value: this.rowToModel(row)?.id };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), mint } };
  }
}


export async function fetchPendingUri(
  this: MetaDataRepository,
  limit: LimitLike = 100
): Promise<RepoResult<MetaDataRow[]>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_PENDING_URI, [limit]);
    return { ok: true, value: res.rows.map((r: any) => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), limit } };
  }
}

export async function fetchPendingOnchain(
  this: MetaDataRepository,
  limit: LimitLike = 100
): Promise<RepoResult<MetaDataRow[]>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_PENDING_ONCHAIN, [limit]);
    return { ok: true, value: res.rows.map((r: any) => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), limit } };
  }
}

export async function fetchBatchByMints(
  this: MetaDataRepository,
  mints: string[]
): Promise<RepoResult<MetaDataRow[]>> {
  if (!mints.length) return { ok: true, value: [] };
  try {
    const res = await this.db.query<MetaDataRow>(
      `SELECT * FROM metadata WHERE mint = ANY($1)`,
      [mints]
    );
    return { ok: true, value: res.rows.map((r: any) => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), mints } };
  }
}

export async function fetchStubs(
  this: MetaDataRepository,
  limit: LimitLike
): Promise<RepoResult<MetaDataRow[]>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_STUBS, [limit]);
    return { ok: true, value: res.rows.map((r: any) => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), limit } };
  }
}

export async function fetchCursor(
  this: MetaDataRepository,
  params: { limit: LimitLike; cursor_created_at?: Date; cursor_id?: IdLike }
): Promise<RepoResult<MetaDataRow[]>> {
  try {
    const { limit, cursor_created_at, cursor_id } = params;
    const res = (cursor_created_at && cursor_id)
      ? await this.db.query(QueryRegistry.FETCH_CURSOR, [cursor_created_at, cursor_created_at, cursor_id, limit])
      : await this.db.query(QueryRegistry.FETCH_CURSOR_INITIAL, [limit]);
    return { ok: true, value: res.rows.map((r: any) => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), params } };
  }
}
