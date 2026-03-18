import { MetaDataRepository } from './../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { buildMetadataUpsert, firstRowIdOrNull } from '@imports';
// ─────────────────────────────────────────────
// ENRICH - Onchain
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ENRICH - Offchain
// ─────────────────────────────────────────────
export async function upsertGenesis(input) {
    if (!input.mint) {
        throw new Error('mint is required for metadata upsert');
    }
    const { sql, values } = buildMetadataUpsert(input);
    const res = await this.db.query(sql, values);
    return this.rowToModel(res.rows[0]);
}
export async function enrichOnchain(id, params) {
    const res = await this.db.query(QueryRegistry.ENRICH_ONCHAIN, [
        id, // $1
        params.name ?? null, // $2
        params.uri ?? null, // $3
        params.symbol ?? null, // $4
        params.metadata_pda ?? null, // $5
        params.update_authority ?? null, // $6
        params.mint_authority ?? null, // $7
        params.freeze_authority ?? null, // $8
        params.seller_fee_basis_points ?? null, // $9
        params.is_mutable ?? null, // $10
        params.primary_sale_happened ?? null, // $11
        params.token_standard ?? null, // $12
        params.onchain_metadata ? JSON.stringify(params.onchain_metadata) : null, // $13
        params.spl_metadata ? JSON.stringify(params.spl_metadata) : null, // $14
    ]);
    return firstRowIdOrNull(res);
}
export async function enrichOffchain(id, params) {
    const res = await this.db.query(QueryRegistry.ENRICH_OFFCHAIN, [
        id, // $1
        params.offchain_metadata.image ?? null, // $2
        params.description ?? null, // $3
        params.external_url ?? null, // $4
        params.offchain_metadata ? JSON.stringify(params.offchain_metadata) : null, // $5
    ]);
    return firstRowIdOrNull(res);
}
