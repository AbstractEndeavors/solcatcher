/**
 * ENRICHMENT CONTEXT
 *
 * Factory + helpers for building the enrichment context object.
 *
 * Changes from previous version:
 *   - createEnrichmentContext and fetchEnrichmentContext collapsed into one
 *     function with a `forceFresh` flag
 *   - All functions take explicit AllDeps, no getRepoServices
 *   - Helper functions take repos as first arg (same shape as repo layer)
 *
 * Pattern: Explicit environment wiring — repos flow from the caller.
 */

import {
  type PairEnrichmentRow,
  type MetaDataEnrichmentRow,
  type EnrichParams,
  type FetchPairDataEnrich,
  type FetchMetaDataEnrich,
  type CreateContextEnrich,
  type DecodedCreateEvents,
  type DecodedTradeEvents,
  type IntLike,
  type SigLike,
  expectSingleRow,
  getIdOrNull,
  SOLANA_PUMP_FUN_PROGRAM_ID,
  type EnrichmentContext,
  type EnrichmentContextWithEvents,
} from '@imports';
import type { AllDeps } from '@db';

// ============================================================
// PAIR RESOLUTION — find or create the pair row
// ============================================================

export async function resolvePairRow(
  repos: AllDeps,
  params: FetchPairDataEnrich
): Promise<PairEnrichmentRow> {
  const { pair_id, mint, program_id } = params;
  let pair: PairEnrichmentRow | null = null;

  if (pair_id) {
    pair = (await repos.pairsRepo.fetchById(pair_id)) as PairEnrichmentRow;
  }
  if (!pair && mint) {
    pair = (await repos.pairsRepo.fetchByMint(mint)) as PairEnrichmentRow;
  }
  if (!pair) {
    const id = await repos.pairsRepo.insertIdentity({ mint, program_id });
    pair = (await repos.pairsRepo.fetchById(id)) as PairEnrichmentRow;
  }
  return expectSingleRow(pair);
}

export async function getPairRow(
  repos: AllDeps,
  params: EnrichParams
): Promise<PairEnrichmentRow> {
  if (params.pair) return params.pair as PairEnrichmentRow;
  return resolvePairRow(repos, params);
}

// ============================================================
// META RESOLUTION — find or create the meta row
// ============================================================

export async function resolveMetaRow(
  repos: AllDeps,
  params: FetchMetaDataEnrich
): Promise<MetaDataEnrichmentRow> {
  let { meta_id, mint, program_id } = params;
  let pair = params.pair as PairEnrichmentRow | undefined;

  // Derive identifiers from pair if needed
  if (!meta_id && !mint) {
    pair = pair || (await getPairRow(repos, params));
    meta_id = pair.meta_id;
    mint = pair.mint;
    program_id = program_id ?? pair.program_id;
  }

  let meta: MetaDataEnrichmentRow | null = null;

  if (meta_id) {
    meta = (await repos.metaDataRepo.fetchById(meta_id)) as MetaDataEnrichmentRow;
  }
  if (!meta && mint) {
    meta = (await repos.metaDataRepo.fetchByMint(mint)) as MetaDataEnrichmentRow;
  }
  if (!meta) {
    const id = await repos.metaDataRepo.insertStub(mint, program_id);
    meta = (await repos.metaDataRepo.fetchById(id)) as MetaDataEnrichmentRow;
  }
  return expectSingleRow(meta);
}

export async function getMetaRow(
  repos: AllDeps,
  params: EnrichParams
): Promise<MetaDataEnrichmentRow> {
  if (params.meta) return params.meta;
  return resolveMetaRow(repos, params);
}

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
export async function buildEnrichmentContext_depreciated(
  repos: AllDeps,
  params: CreateContextEnrich,
  forceFresh = false
): Promise<EnrichmentContext> {
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
    program_id:
      params.program_id ||
      pair.program_id ||
      meta.program_id ||
      SOLANA_PUMP_FUN_PROGRAM_ID,
    pair,
    meta,
    enrich_fields: params.enrich_fields || { pair: [], meta: [] },
    decode_summary:params.decode_summary, 
    decoded:params.decoded
  };
}
// ============================================================
// EVENT CONTEXT BUILDER
// ============================================================

export function buildEventContext(
  ctx: EnrichmentContextWithEvents,
  event: DecodedTradeEvents | DecodedCreateEvents
) {
  return {
    signature: ctx.pair.signature as SigLike,
    slot: event.slot as IntLike,
    program_id: event.provenance.program_id || ctx.pair.program_id,
    log_id: ctx.pair.log_id,
    invocation: event.provenance.invocation_index,
    mint: event.mint,
  };
}

// ============================================================
// CONVENIENCE ALIASES — drop-in for existing call sites
// ============================================================

/** @deprecated Use buildEnrichmentContext(repos, params, false) */
/*export const createEnrichmentContext = (
  repos: AllDeps,
  params: CreateContextEnrich
) => buildEnrichmentContext(repos, params, false);

/** @deprecated Use buildEnrichmentContext(repos, params, true) */
/*export const fetchEnrichmentContext = (
  repos: AllDeps,
  params: CreateContextEnrich
) => buildEnrichmentContext(repos, params, true);
*/
// ============================================================
// RE-FETCH META ONLY — for enrichers that persist meta changes
// ============================================================

export async function refreshMetaRow(
  repos: AllDeps,
  ctx: EnrichmentContext
): Promise<MetaDataEnrichmentRow> {
  return resolveMetaRow(repos, ctx as FetchMetaDataEnrich);
}
