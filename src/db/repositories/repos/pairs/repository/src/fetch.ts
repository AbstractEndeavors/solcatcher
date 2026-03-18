import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike, AddressLike, PairRow, MintLike, LimitLike, SigLike, RepoResult } from '@imports';
import { isId, isMint, isAddress, isSignature } from '@imports';
export async function fetch(
  this: PairsRepository,
  params: {
    id?: IdLike;
    mint?: MintLike;
    program_id?: AddressLike;
    bonding_curve?: AddressLike;
    associated_bonding_curve?: AddressLike;
    signature?: SigLike;
  }
): Promise<RepoResult<PairRow>> {
  if (isId(params.id)) {
    const result = await this.fetchById(params.id);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isMint(params.mint) && isAddress(params.program_id)) {
    const result = await this.fetchByMintAndProgram(params.mint, params.program_id);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isMint(params.mint)) {
    const result = await this.fetchByMint(params.mint);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isAddress(params.bonding_curve)) {
    const result = await this.fetchByBondingCurve(params.bonding_curve);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isAddress(params.associated_bonding_curve)) {
    const result = await this.fetchByAssociatedBondingCurve(params.associated_bonding_curve);
    if (result.ok || result.reason !== 'not_found') return result;
  }
  if (isSignature(params.signature)) {
    const result = await this.fetchByGenesisSignature(params.signature);
    if (result.ok || result.reason !== 'not_found') return result;
  }

  const hasValidKey = isId(params.id) || isMint(params.mint) ||
    isAddress(params.bonding_curve) || isAddress(params.associated_bonding_curve) ||
    isSignature(params.signature);

  return hasValidKey
    ? { ok: false, reason: 'not_found', meta: { params } }
    : { ok: false, reason: 'invalid_fetch_params', meta: { params } };
}
export async function fetchById(
  this: PairsRepository,
  id: IdLike
): Promise<RepoResult<PairRow>> {
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
  this: PairsRepository,
  mint: MintLike
): Promise<RepoResult<PairRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_MINT, [mint]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { mint } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), mint } };
  }
}


export async function fetchByMintAndProgram(
  this: PairsRepository,
  mint: MintLike,
  program_id: AddressLike
): Promise<RepoResult<PairRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_MINT_AND_PROGRAM, [mint, program_id]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { mint, program_id } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), mint, program_id } };
  }
}


export async function fetchByBondingCurve(
  this: PairsRepository,
  curve: AddressLike
): Promise<RepoResult<PairRow>> {
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
  this: PairsRepository,
  curve: AddressLike
): Promise<RepoResult<PairRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_ASSOCIATED_BONDING_CURVE, [curve]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { curve } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), curve } };
  }
}

export async function fetchByGenesisSignature(
  this: PairsRepository,
  sig: SigLike
): Promise<RepoResult<PairRow>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_BY_SIGNATURE, [sig]);
    const row = res.rows[0];
    if (!row) return { ok: false, reason: 'not_found', meta: { sig } };
    return { ok: true, value: this.rowToModel(row) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), sig } };
  }
}


export async function fetchStubs(
  this: PairsRepository,
  limit: LimitLike
): Promise<RepoResult<PairRow[]>> {
  try {
    const res = await this.db.query(QueryRegistry.FETCH_STUBS, [limit]);
    return { ok: true, value: res.rows.map((r: any) => this.rowToModel(r)) };
  } catch (err) {
    return { ok: false, reason: 'db_error', meta: { err: String(err), limit } };
  }
}

export async function fetchCursor(
  this: PairsRepository,
  params: { limit: LimitLike; cursor_created_at?: Date; cursor_id?: IdLike }
): Promise<RepoResult<PairRow[]>> {
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
