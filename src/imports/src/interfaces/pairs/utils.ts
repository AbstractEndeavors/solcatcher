import {ensureString,type EnrichedCreateEvent,minutesSince} from './imports.js';
import type {InsertPairParams,PairRow} from './schemas.js';
import {PAIR_ENRICH_GROUPS,type PairEnrichGroup} from './constants.js';
/**
 * Convert enriched create event to DB-ready insert params.
 * All bigints → strings for NUMERIC columns.
 */

export function toInsertPairParams(
  enriched: EnrichedCreateEvent
): InsertPairParams {
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
    slot:enriched.slot,
    signature: enriched.signature,
    log_id: enriched.log_id,
    meta_id: enriched.meta_id,
    txn_id: enriched.txn_id,
  };

}
/**
 * Check if pair needs volume refresh
 */
// Pure — no async, no mutation
export function needsVolumeRefresh(pair: PairRow): boolean {
  if (!pair.processed_at) return true;
  const msPerHour = 1000 * 60 * 60;
  const age = (Date.now() - new Date(pair.processed_at).getTime()) / msPerHour;
  return age > 1;
}
export function isPairStatusConsistent(row: PairRow): boolean {
  const missing = derivePairEnrichTypes(row);
  if (row.status === 'complete' && missing.length > 0) return false;
  if (row.status === 'stub' && missing.length === 0) return false;
  return true;
}
export function derivePairEnrichTypes(row: PairRow | null): PairEnrichGroup[] {
  if (!row) return ['genesis', 'pda', 'provenance'];

  // Don't trust status — derive from actual field presence
  const missing = (Object.keys(PAIR_ENRICH_GROUPS) as PairEnrichGroup[]).filter(
    group => PAIR_ENRICH_GROUPS[group].some(f => !row[f])
  );

  return missing;
}



