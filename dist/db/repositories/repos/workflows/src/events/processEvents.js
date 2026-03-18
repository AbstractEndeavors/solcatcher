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
import { LogOrchestrator } from './../LogOrchestrator.js';
import {} from '@imports';
import { getIdOrNull, expectSingleRow, processTradeEventErrorGuard, extractDecodedTradeEventErrorGuard, isDecodedResult, ensureArray, processCreateEventErrorGuard, extractDecodedCreateEventErrorGuard, getDecodeFromPayload, SOLANA_PUMP_FUN_PROGRAM_ID, } from '@imports';
import { buildEnrichmentContext, } from '../enricher/context.js';
import {} from '@imports';
import { getDeps } from '@repoServices';
// ============================================================
// IDENTITY RESOLUTION — find or create pair/meta stubs
// ============================================================
export async function getOrInsertPairIdentity(params) {
    let pair = await this.cfg.pairs.fetch(params);
    if (!pair) {
        const pair_id = (await this.cfg.pairs.insertIdentity(params));
        pair = await this.cfg.pairs.fetchById(pair_id);
    }
    return expectSingleRow(pair);
}
export async function getOrInsertMetaIdentity(params) {
    return await this.cfg.metaData.assureIdentity(params);
}
// ============================================================
// EVENT CONTEXT — build context for a single decoded event
// ============================================================
export async function getEventContext(event) {
    const mint = event.mint;
    const ctx = { ...event.provenance, mint };
    const logDataRows = await this.cfg.logData.fetchBySignature(ctx.signature);
    const logDataRow = expectSingleRow(logDataRows);
    ctx.program_id = ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    ctx.slot = logDataRow.slot;
    ctx.log_id = logDataRow.id;
    ctx.pair_id = null;
    ctx.meta_id = null;
    ctx.pairEnrich = false;
    ctx.metaEnrich = false;
    if (mint) {
        const { id: pair_id, needsEnrich: pairEnrich } = await this.cfg.pairs.assureIdentityEnrich(ctx);
        const { id: meta_id, needsEnrich: metaEnrich } = await this.cfg.metaData.assureIdentityEnrich(ctx);
        ctx.pair_id = pair_id;
        ctx.meta_id = meta_id;
        ctx.pairEnrich = pairEnrich;
        ctx.metaEnrich = metaEnrich;
    }
    return ctx;
}
// ============================================================
// ENRICH DISPATCH — explicit publisher, no hidden singleton
// ============================================================
export async function doEnrich(publisher, ctx) {
    if (ctx.pairEnrich) {
        await publisher.publish('pairEnrich', ctx);
    }
    if (ctx.metaEnrich) {
        await publisher.publish('metaEnrich', ctx);
    }
}
// ============================================================
// TRADE EVENT
// ============================================================
export async function processTradeEvent(event) {
    const ctx = await this.getEventContext(event);
    console.log('ctx', ctx);
    const { decoded, enriched, insertParams } = processTradeEventErrorGuard(event, ctx);
    ctx.txn_id = await this.cfg.transactions.insertTransactions(insertParams);
    await doEnrich(this.cfg.publisher, ctx);
    return ctx;
}
// ============================================================
// CREATE EVENT
// ============================================================
export async function processCreateEvent(event) {
    const ctx = await this.getEventContext(event);
    const { decoded, enriched, insertParams } = processCreateEventErrorGuard(event, ctx);
    await this.cfg.metaData.insertFromCreateEvent(enriched.metadata);
    await this.cfg.pairs.insert(insertParams);
    ctx.pairEnrich = false;
    await doEnrich(this.cfg.publisher, ctx);
    return ctx;
}
export async function eventOrchestrator(ctx) {
    const publisher = this.cfg.publisher;
    const payloads = await this.cfg.logPayloads.fetchBySignature(ctx.signature);
    // Decode all payloads (CPU-bound, no I/O)
    const decodedPayloads = ensureArray(payloads)
        .map((payload) => ({
        payload,
        decoded: getDecodeFromPayload(payload),
    }))
        .filter((item) => {
        const d = item.decoded;
        return (d !== null &&
            isDecodedResult(d) &&
            d.data?.mint != null &&
            typeof d.data.mint === 'string');
    });
    const mints = [
        ...new Set(decodedPayloads.map((d) => String(d.decoded.data.mint))),
    ];
    if (mints.length === 0)
        return [];
    // Batch fetch — one round trip per entity type
    const [pairs, metas] = await Promise.all([
        this.cfg.pairs.fetchBatchByMints(mints, [SOLANA_PUMP_FUN_PROGRAM_ID]),
        this.cfg.metaData.fetchBatchByMints(mints, [SOLANA_PUMP_FUN_PROGRAM_ID]),
    ]);
    const pairMap = new Map(pairs.map((p) => [p.mint, p]));
    const metaMap = new Map(metas.map((m) => [m.mint, m]));
    // Process with allSettled — partial failures are logged, not fatal
    const settled = await Promise.allSettled(decodedPayloads.map(async ({ payload, decoded }) => {
        const mint = String(decoded.data.mint);
        let pair = pairMap.get(mint);
        let meta = metaMap.get(mint);
        if (!pair) {
            const pair_id = (await this.cfg.pairs.insertIdentity({
                mint,
                program_id: ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID,
            }));
            const fetched = await this.cfg.pairs.fetchById(pair_id);
            if (!fetched)
                throw new Error(`pair insert→fetch failed: ${pair_id}`);
            pair = fetched;
            pairMap.set(mint, pair);
        }
        if (!meta) {
            const meta_id = (await this.cfg.metaData.r.insertIdentity({
                mint,
                program_id: ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID,
            }));
            const fetched = await this.cfg.metaData.r.fetchById(meta_id);
            if (!fetched)
                throw new Error(`meta insert→fetch failed: ${meta_id}`);
            meta = fetched;
            metaMap.set(mint, meta);
        }
        const buildCtx = {
            signature: ctx.signature,
            program_id: ctx.program_id || pair.program_id || SOLANA_PUMP_FUN_PROGRAM_ID,
            slot: ctx.slot,
            log_id: ctx.log_id,
            invocation: payload.invocation_index,
            mint,
            pair_id: pair.id,
            meta_id: meta.id,
        };
        const { success: isTrade, data: tradeDecoded } = extractDecodedTradeEventErrorGuard(decoded);
        if (isTrade && tradeDecoded) {
            const { insertParams } = processTradeEventErrorGuard(tradeDecoded, buildCtx);
            buildCtx.txn_id = await this.cfg.transactions.insertTransactions(insertParams);
        }
        else {
            const { success: isCreate, data: createDecoded } = extractDecodedCreateEventErrorGuard(decoded);
            if (isCreate && createDecoded) {
                const { enriched, insertParams } = processCreateEventErrorGuard(createDecoded, buildCtx);
                await this.cfg.metaData.insertFromCreateEvent(enriched.metadata);
                await this.cfg.pairs.insert({ meta_id: meta.id, ...insertParams });
                await publisher.publish('pairEnrich', buildCtx);
            }
        }
        return buildCtx;
    }));
    // Log failures, collect successes
    const results = [];
    for (const result of settled) {
        if (result.status === 'fulfilled') {
            results.push(result.value);
        }
        else {
            console.error({
                logType: 'event_orchestrator_error',
                signature: ctx.signature,
                error: result.reason?.message ?? String(result.reason),
            });
        }
    }
    return results;
}
// ============================================================
// ENRICH PAIR — explicit deps from orchestrator
// ============================================================
export async function enrichPair(params) {
    const repos = this.enrichmentRepos;
    const ctx = await buildEnrichmentContext(repos, params);
    const deps = await getDeps();
    // Import pipeline runner — the pipeline itself is still defined
    // in the enricher module, but deps are now explicit
    const { ENRICHMENT_PIPELINE, runEnrichmentPipeline } = await import('../enricher/index.js');
    await runEnrichmentPipeline(ENRICHMENT_PIPELINE, ctx, deps);
    return ctx;
}
