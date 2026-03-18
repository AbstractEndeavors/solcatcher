/**
 * PROCESS EVENTS
 *
 * Mixin methods for LogOrchestrator — event processing lifecycle.
 *
 * Changes from previous version:
 *   - doEnrich takes explicit publisher, no getPublisher() singleton
 *   - getEventContext uses this.cfg, not getRepoServices
 *   - Fixed typo: eventOrchistrator → eventOrchestrator
 *   - enrichPair uses explicit deps from orchestrator
 *   - Promise.allSettled for batch processing (partial success)
 *
 * Pattern: Every dependency flows through this.cfg
 */

import { type MintLike } from '@imports';
import type {
  IdLike,
  FetchContext,
  PairRow,
  MetaDataEnrichmentRow,
  PairEnrichmentRow,
  CreateContextEnrich,
  DecodedTradeEvents,
  DecodedCreateEvents,
} from '@imports';
import {
  SOLANA_PUMP_FUN_PROGRAM_ID,
  expectRepoValue
} from '@imports';
import { getDeps,type AllDeps} from '@repoServices';
// ============================================================
// IDENTITY RESOLUTION — find or create pair/meta stubs
// ============================================================

export async function getOrInsertPairIdentity(
  params: FetchContext,
  deps: AllDeps,
): Promise<PairRow> {
  const pairRepoResult = await deps.pairsRepo.assureIdentityEnrich(params);
  const pairRepo = expectRepoValue(pairRepoResult)
  return  pairRepo.row
}

export async function getOrInsertMetaIdentity(
  params: FetchContext,
  deps: AllDeps,
): Promise<IdLike> {
  const pairRepoResult = await deps.metaDataRepo.assureIdentityEnrich(params);
  const pairRepo = expectRepoValue(pairRepoResult)
  return  pairRepo.id
}

// ============================================================
// EVENT CONTEXT — build context for a single decoded event
// ============================================================

export async function getEventContext(
  event: DecodedTradeEvents | DecodedCreateEvents,
  deps: AllDeps,
): Promise<CreateContextEnrich> {
  const mint: MintLike = event?.mint;
  const ctx: CreateContextEnrich = { ...event.provenance, mint };
  deps = await getDeps(deps);
  const { pairsRepo, metaDataRepo, logDataService } = deps;

  // Use forwarded values if present — skip the DB round-trip
  if ((event as any).log_id != null && (event as any).slot != null) {
    ctx.log_id = (event as any).log_id;
    ctx.slot   = (event as any).slot;
  } else {
    const logDataRows = await logDataService.fetchBySignature(ctx.signature);
    const logDataRow  = expectRepoValue(logDataRows);
    ctx.log_id = logDataRow.id;
    ctx.slot   = logDataRow.slot;
  }

  ctx.program_id = ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
  ctx.pair_id    = null;
  ctx.meta_id    = null;
  ctx.pairEnrich = false;
  ctx.metaEnrich = false;

  // These two are independent — run them in parallel
  const [pairResult, metaResult] = await Promise.all([
    pairsRepo.assureIdentityEnrich(ctx),
    metaDataRepo.assureIdentityEnrich(ctx),
  ]);
  const pairRepo = expectRepoValue(pairResult)
  const metaRepo = expectRepoValue(metaResult)
  ctx.pair_id    = pairRepo.id;
  ctx.pairEnrich = pairRepo.needsEnrich;
  ctx.pair       = pairRepo.row as PairEnrichmentRow;
  ctx.meta_id    = metaRepo.id;
  ctx.metaEnrich = metaRepo.needsEnrich;
  ctx.meta       = metaRepo.row as MetaDataEnrichmentRow;

  return ctx;
}

