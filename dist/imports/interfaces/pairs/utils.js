import { ensureString } from './imports.js';
/**
 * Convert enriched create event to DB-ready insert params.
 * All bigints → strings for NUMERIC columns.
 */
export function toInsertPairParams(enriched) {
    const { decoded } = enriched;
    return {
        // identity
        mint: decoded.mint,
        program_id: enriched.program_id,
        token_program: decoded.token_program,
        bonding_curve: decoded.bonding_curve,
        associated_bonding_curve: enriched.associated_bonding_curve,
        creator: decoded.creator,
        // genesis reserves (bigint → string)
        virtual_token_reserves: ensureString(decoded.virtual_token_reserves),
        virtual_sol_reserves: ensureString(decoded.virtual_sol_reserves),
        real_token_reserves: ensureString(decoded.real_token_reserves),
        token_total_supply: ensureString(decoded.token_total_supply),
        // time
        timestamp: enriched.timestamp,
        // provenance
        signature: enriched.signature,
        log_id: enriched.log_id,
        meta_id: enriched.meta_id,
        txn_id: enriched.txn_id,
    };
}
/**
 * Check if pair needs volume refresh
 */
export async function needsVolumeRefresh(pair) {
    // Refresh if no processed_at or if stale (customize threshold)
    if (!pair.processed_at)
        return true;
    const now = new Date();
    const processedAt = new Date(pair.processed_at);
    const hoursSinceProcessed = (now.getTime() - processedAt.getTime()) / (1000 * 60 * 60);
    // Refresh if older than 1 hour (customize as needed)
    return hoursSinceProcessed > 1;
}
