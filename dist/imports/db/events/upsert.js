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
import {} from '@imports';
import { expectSingleRow, processTradeEventErrorGuard, processCreateEventErrorGuard, SOLANA_PUMP_FUN_PROGRAM_ID, expectRepoValue } from '@imports';
import { getDeps } from '@repoServices';
import { metaDataEnrich } from './../metaData/enrich/index.js';
import { pairEnrich } from './../pairs/index.js';
import { runEnrichmentPipeline } from './../enricher/index.js';
// ============================================================
// IDENTITY RESOLUTION — find or create pair/meta stubs
// ============================================================
export async function getOrInsertPairIdentity(params, deps = null) {
    deps = await getDeps(deps);
    const { pairsService } = deps;
    let pair = await pairsService.fetch(params);
    if (!pair) {
        const pair_id = (await pairsService.insertIdentity(params));
        pair = await pairsService.fetchById(pair_id);
    }
    return expectSingleRow(pair);
}
export async function getOrInsertMetaIdentity(params, deps = null) {
    deps = await getDeps(deps);
    const { metaDataService } = deps;
    return await metaDataService.assureIdentity(params);
}
// ============================================================
// EVENT CONTEXT — build context for a single decoded event
// ============================================================
export async function getEventContext(event, deps = null) {
    const mint = event?.mint;
    const ctx = { ...event.provenance, mint };
    deps = await getDeps(deps);
    const { pairsService, metaDataRepo, logDataService } = deps;
    // Use forwarded values if present — skip the DB round-trip
    if (event.log_id != null && event.slot != null) {
        ctx.log_id = event.log_id;
        ctx.slot = event.slot;
    }
    else {
        const logDataRows = await logDataService.fetchBySignature(ctx.signature);
        const logDataRow = expectRepoValue(logDataRows);
        ctx.log_id = logDataRow.id;
        ctx.slot = logDataRow.slot;
    }
    ctx.program_id = ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    ctx.pair_id = null;
    ctx.meta_id = null;
    ctx.pairEnrich = false;
    ctx.metaEnrich = false;
    // These two are independent — run them in parallel
    const [pairResult, metaResult] = await Promise.all([
        pairsService.assureIdentityEnrich(ctx),
        metaDataRepo.assureIdentityEnrich(ctx),
    ]);
    ctx.pair_id = pairResult.id;
    ctx.pairEnrich = pairResult.needsEnrich;
    ctx.pair = pairResult.row;
    ctx.meta_id = metaResult.id;
    ctx.metaEnrich = metaResult.needsEnrich;
    ctx.meta = metaResult.row;
    return ctx;
}
// ============================================================
// ENRICH DISPATCH — explicit publisher, no hidden singleton
// ============================================================
export async function doEnrich(ctx, deps = null, publish = true) {
    deps = await getDeps(deps);
    const { publisher } = deps;
    if (ctx.pairEnrich) {
        if (publish) {
            await publisher.publish('genesisLookup', ctx);
        }
        else {
            await runEnrichmentPipeline(ctx, deps);
        }
    }
    if (ctx.metaEnrich) {
        if (publish) {
            await publisher.publish('metaDataEnrich', ctx);
        }
        else {
            await runEnrichmentPipeline(ctx, deps);
        }
    }
}
// ============================================================
// TRADE EVENT
// ============================================================
export async function processTradeEvent(event, publish = true, deps = null) {
    deps = await getDeps(deps); // resolve once
    const ctx = await getEventContext(event, deps); // pass resolved deps
    const { insertParams } = processTradeEventErrorGuard(event, ctx);
    ctx.txn_id = await deps.transactionsService.insertTransactions(insertParams);
    await doEnrich(ctx, deps, publish);
    return ctx;
}
// ============================================================
// CREATE EVENT
// ============================================================
export async function processCreateEvent(event, publish = true, deps = null) {
    const ctx = await getEventContext(event, deps);
    const { enriched, insertParams } = processCreateEventErrorGuard(event, ctx);
    deps = await getDeps(deps);
    const { pairsRepo, metaDataService } = deps;
    await metaDataService.insertFromCreateEvent(enriched.metadata);
    await pairsRepo.insert(insertParams);
    ctx.pairEnrich = false;
    await doEnrich(ctx, deps, publish);
    return ctx;
}
