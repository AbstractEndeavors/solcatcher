import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { isId, isMint, isAddress, isSignature } from '@imports';
// ─────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────
export async function fetch(params) {
    let row = null;
    const { id, mint, program_id, bonding_curve, associated_bonding_curve, signature } = params;
    if (isId(id)) {
        row = await this.fetchById(id);
        if (row != null)
            return row;
    }
    // Mint + program_id takes precedence
    if (isMint(mint) && isAddress(program_id)) {
        row = await this.fetchByMintAndProgram(mint, program_id);
        if (row != null)
            return row;
    }
    // Mint-only lookup (new)
    if (isMint(mint)) {
        row = await this.fetchByMint(mint);
        if (row != null)
            return row;
    }
    if (isAddress(bonding_curve)) {
        row = await this.fetchByBondingCurve(bonding_curve);
        if (row != null)
            return row;
    }
    if (isAddress(associated_bonding_curve)) {
        row = await this.fetchByAssociatedBondingCurve(associated_bonding_curve);
        if (row != null)
            return row;
    }
    if (isSignature(signature)) {
        row = await this.fetchByGenesisSignature(signature);
        if (row != null)
            return row;
    }
    return null;
}
// Public methods now just delegate
export async function fetchById(id) {
    return this.fetchOne('FETCH_BY_ID', id);
}
export async function fetchByBondingCurve(curve) {
    return this.fetchOne('FETCH_BY_BONDING_CURVE', curve);
}
export async function fetchByAssociatedBondingCurve(curve) {
    return this.fetchOne('FETCH_BY_ASSOCIATED_BONDING_CURVE', curve);
}
export async function fetchByGenesisSignature(sig) {
    return this.fetchOne('FETCH_BY_SIGNATURE', sig);
}
export async function fetchByMint(mint) {
    return this.fetchOne('FETCH_BY_MINT', mint);
}
export async function fetchByMintAndProgram(mint, program_id) {
    // Can't use fetchOne because it only takes 1 param
    // So keep the explicit query
    const res = await this.db.query(QueryRegistry.FETCH_BY_MINT_AND_PROGRAM, [mint, program_id]);
    const row = res.rows[0];
    return row ? this.rowToModel(row) : null;
}
export async function fetchStubs(limit) {
    const res = await this.db.query(QueryRegistry.FETCH_STUBS, [limit]);
    return res.rows.map((r) => this.rowToModel(r));
}
// ─────────────────────────────────────────────
// CURSOR FETCH (KEYSET PAGINATION)
// ─────────────────────────────────────────────
export async function fetchCursor(params) {
    const { limit, cursor_created_at, cursor_id } = params;
    let res;
    if (cursor_created_at && cursor_id) {
        res = await this.db.query(QueryRegistry.FETCH_CURSOR, [cursor_created_at, cursor_created_at, cursor_id, limit]);
    }
    else {
        res = await this.db.query(QueryRegistry.FETCH_CURSOR_INITIAL, [limit]);
    }
    return res.rows.map((r) => this.rowToModel(r));
}
