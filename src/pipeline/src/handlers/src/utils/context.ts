import {type CreateContextEnrich,type IntLike,type SigLike, type DecodedTradeEvents,type EnrichmentContextWithEvents,type DecodedCreateEvents,type PairEnrichmentRow,type MetaDataEnrichmentRow,type MintLike, expectRepoValue,SOLANA_PUMP_FUN_PROGRAM_ID} from '@imports';
import {buildEnrichmentContext} from './../utils/index.js'
import type { AllDeps } from '@db';
// ============================================================
// CONVENIENCE ALIASES — drop-in for existing call sites
// ============================================================

/** @deprecated Use buildEnrichmentContext(repos, params, false) */
export const createEnrichmentContext = (
  params: CreateContextEnrich,
  repos: AllDeps
) => buildEnrichmentContext(params,repos,  false);

/** @deprecated Use buildEnrichmentContext(repos, params, true) */
export const fetchEnrichmentContext = (
  params: CreateContextEnrich,
  repos: AllDeps
) => buildEnrichmentContext(params, repos, true);


// ============================================================
// EVENT CONTEXT — build context for a single decoded event
// ============================================================

export async function getEventContext(
  event: DecodedTradeEvents | DecodedCreateEvents,
  deps: AllDeps,
): Promise<CreateContextEnrich> {
  const mint: MintLike = event?.mint;
  const ctx: CreateContextEnrich = { ...event.provenance, mint };
  // Use forwarded values if present — skip the DB round-trip
  if ((event as any).log_id != null && (event as any).slot != null) {
    ctx.log_id = (event as any).log_id;
    ctx.slot   = (event as any).slot;
  } else {
    const logDataRows = await deps.logDataService.fetchBySignature(ctx.signature);
    const logDataRow  = expectRepoValue(logDataRows);
    ctx.log_id = logDataRow.id;
    ctx.slot   = logDataRow.slot;
  }
  ctx.program_id = ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
  if (!ctx.pair_id || !ctx.pair){
      const pairsRepo = deps.pairsRepo;
      const repoResult = await pairsRepo.assureIdentityEnrich(ctx);
      if (repoResult.ok || repoResult.value) {
        const {
            id:pair_id,
            needsEnrich:pairNeedsEnrich,
            enrichType:pairenrichType,
            row:pair,
          } = repoResult.value;
          ctx.pair_id    = pair_id;
          ctx.pairEnrich = pairNeedsEnrich;
          ctx.pair       = pair as PairEnrichmentRow;
      }

  }
  if (!ctx.meta_id || !ctx.meta){
      const metaDataRepo = deps.metaDataRepo;
      const repoResult = await metaDataRepo.assureIdentityEnrich(ctx);
      if (repoResult.ok || repoResult.value) {
        const {
            id:meta_id,
            needsEnrich:metaNeedsEnrich,
            enrichType:metaEnrichType,
            row:meta,
          } = repoResult.value;
          ctx.pair_id    = meta_id;
          ctx.pairEnrich = metaNeedsEnrich;
          ctx.meta       = meta as MetaDataEnrichmentRow;
      }
  }
  return ctx;
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