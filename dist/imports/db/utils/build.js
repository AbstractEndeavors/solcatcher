import { getIdOrNull, } from './../../interfaces/index.js';
import { resolveMetaRow } from './../metaData/resolve.js';
import { getMetaRow } from './../metaData/get.js';
import { resolvePairRow } from './../pairs/resolve.js';
import { getPairRow } from './../pairs/get.js';
import { SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
// ============================================================
// CONTEXT FACTORY — single function, forceFresh controls caching
// ============================================================
/**
 * Build an EnrichmentContext from params.
 *
 * @param forceFresh - when true, always re-fetches pair and meta from DB.
 *   Use `true` after persisting changes (the old fetchEnrichmentContext).
 *   Default `false` uses cached rows from params if present
 *   (the old createEnrichmentContext).
 */
export async function buildEnrichmentContext(repos, params, forceFresh = false) {
    const pair = forceFresh
        ? await resolvePairRow(repos, params)
        : await getPairRow(repos, params);
    const meta = forceFresh
        ? await resolveMetaRow(repos, { ...params, pair })
        : await getMetaRow(repos, { ...params, pair });
    return {
        pair_id: params.pair_id || getIdOrNull(pair),
        meta_id: params.meta_id || getIdOrNull(meta) || pair.meta_id,
        mint: params.mint || pair.mint || meta.mint,
        program_id: params.program_id ||
            pair.program_id ||
            meta.program_id ||
            SOLANA_PUMP_FUN_PROGRAM_ID,
        pair,
        meta,
        enrich_fields: params.enrich_fields || { pair: [], meta: [] },
        decode_summary: params.decode_summary,
        decoded: params.decoded
    };
}
