// ─────────────────────────────────────────────
//// ENRICH (POST-GENESIS)
// ─────────────────────────────────────────────
import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { firstRowIdOrNull } from '@imports';
export async function enrich(pairId, params) {
    const res = await this.db.query(QueryRegistry.ENRICH_PAIR, [
        pairId,
        params.log_id ?? null,
        params.txn_id ?? null,
        params.meta_id ?? null,
        params.signature ?? null,
        params.associated_bonding_curve ?? null,
    ]);
    return firstRowIdOrNull(res);
}
export async function enrichFull(pairId, params) {
    const res = await this.db.query(QueryRegistry.ENRICH_FULL, [
        pairId,
        params.bonding_curve ?? null,
        params.associated_bonding_curve ?? null,
        params.token_program ?? null,
        params.creator ?? null,
        params.virtual_token_reserves?.toString() ?? null,
        params.virtual_sol_reserves?.toString() ?? null,
        params.real_token_reserves?.toString() ?? null,
        params.token_total_supply?.toString() ?? null,
    ]);
    return firstRowIdOrNull(res);
}
