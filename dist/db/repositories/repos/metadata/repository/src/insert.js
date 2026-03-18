import { MetaDataRepository } from './../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { firstRowIdOrNull } from '@imports';
export async function insertStub(mint, program_id) {
    if (!program_id) {
        throw new Error(`insertStub(): program_id required (mint=${mint})`);
    }
    const res = await this.db.query(QueryRegistry.INSERT_STUB, [mint, program_id]);
    // Happy path
    if (res.rows[0]?.id) {
        return firstRowIdOrNull(res);
    }
    // Conflict → fetch existing
    const existing = await this.fetchByMint(mint);
    if (!existing) {
        throw new Error('insertStub(): invariant violation');
    }
    return existing.id;
}
// ─────────────────────────────────────────────
// INSERT - Genesis (upsert)
// ─────────────────────────────────────────────
export async function insertGenesis(params) {
    const res = await this.db.query(QueryRegistry.INSERT_GENESIS, [
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
    ]);
    return firstRowIdOrNull(res);
}
