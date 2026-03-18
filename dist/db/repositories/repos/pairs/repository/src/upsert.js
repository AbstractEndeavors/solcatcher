import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import { ensureStringOptional, firstRowIdOrNull, firstRowOrNull } from '@imports';
export async function updateChainTimestamp(pairId, timestamp) {
    const res = await this.db.query(QueryRegistry.UPDATE_CHAIN_TIMESTAMP, [pairId, timestamp]);
    return firstRowIdOrNull(res);
}
export async function upsert(params) {
    const res = await this.db.query(QueryRegistry.UPSERT_PAIR_FULL, [
        params.mint,
        params.program_id,
        params.token_program ?? null,
        params.bonding_curve ?? null,
        params.associated_bonding_curve ?? null,
        params.creator ?? null,
        params.signature ?? null,
        ensureStringOptional(params.virtual_token_reserves),
        ensureStringOptional(params.virtual_sol_reserves),
        ensureStringOptional(params.real_token_reserves),
        ensureStringOptional(params.token_total_supply),
        params.log_id ?? null,
        params.txn_id ?? null,
        params.meta_id ?? null,
        params.slot ?? null,
        params.timestamp ?? null,
    ]);
    const row = firstRowOrNull(res);
    if (!res || !row) {
        return null;
    }
    return row[0];
}
