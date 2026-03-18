import { fetchTxnInsertData } from '@rateLimiter';
import { getDecodeFromPayload, extractDecodedTradeEventErrorGuard, processTradeEventErrorGuard, processCreateEventErrorGuard, extractDecodedCreateEventErrorGuard, classifyPayloadBatch } from '@imports';
import { getDeps } from '@repoServices';
import { dispatchEventBatch, getEventContext, processTradeEvent, processCreateEvent } from './../events/index.js';
import { normalizeRawEvents } from './../events/normalize.js';
import { persistChanges } from './../enricher/index.js';
export function expectRepoValue(result, context) {
    if (!result.ok) {
        throw new Error(context
            ? `${context}: ${result.reason ?? 'repo_error'}`
            : result.reason ?? 'repo_error');
    }
    if (result.value == null) {
        throw new Error(context
            ? `${context}: expected value, got null`
            : 'expected value, got null');
    }
    return result.value;
}
import { EventKind } from '@imports';
// ============================================================
// kind is already set by classifier — switch on it directly.
// No re-extraction. No guard re-runs.
// ============================================================
export async function fetchAndInsertTxn(options) {
    const deps = await getDeps();
    const payload = await fetchTxnInsertData(options);
    const { logDataService } = deps;
    return await logDataService.r.insert(payload);
}
export async function fetchTxnRepoData(options) {
    const deps = await getDeps();
    const { logDataService } = deps;
    return await logDataService.fetch(options);
}
export async function fetchOrCreateTxnRepoResult(options) {
    let repoResult = await fetchTxnRepoData(options);
    if (!repoResult.value) {
        repoResult = await fetchAndInsertTxn(options);
    }
    return repoResult;
}
export async function fetchOrCreateTxnRepoValue(options) {
    const repoResult = await fetchOrCreateTxnRepoResult(options);
    return expectRepoValue(repoResult, 'fetchOrCreateTxn');
}
export async function fetchOrCreateTxnPayloadSummaries(options) {
    const deps = await getDeps();
    const logData = await fetchOrCreateTxnRepoValue(options);
    return await deps.logPayloadService.extractAndInsertFromRawLogData(logData);
}
export async function fetchOrCreateTxnPayloads(options) {
    const deps = await getDeps();
    const payloadBatches = await fetchOrCreateTxnPayloadSummaries(options);
    return await deps.logPayloadService.extractPayloadsFromSummaryHydrate(payloadBatches);
}
export async function fetchOrCreateTxnEvents(options) {
    const deps = await getDeps();
    const payloadBatches = await fetchOrCreateTxnPayloads(options);
    const events = [];
    for (const payload of payloadBatches) {
        const event = getDecodeFromPayload(payload);
        events.push(event);
    }
    return events;
}
export async function fetchOrCreateNormalizedEvents(options) {
    const deps = await getDeps();
    const payloadBatches = await fetchOrCreateTxnEvents(options);
    return normalizeRawEvents(payloadBatches);
}
export async function fetchOrCreateClassifiedEvents(options) {
    const deps = await getDeps();
    const payloadBatches = await fetchOrCreateTxnPayloads(options);
    return classifyPayloadBatch(payloadBatches, deps.decoderRegistry);
}
export async function fetchOrCreateTxnDispatchEvents(options) {
    const deps = await getDeps();
    const { events } = await fetchOrCreateClassifiedEvents(options);
    return dispatchEventBatch(events, deps, false);
}
export async function fetchOrCreateTxnEventContexts(options) {
    const deps = await getDeps();
    const { events, skipped } = await fetchOrCreateClassifiedEvents(options);
    if (skipped > 0) {
        console.debug(`[dispatch] skipped ${skipped} undecodable payloads`);
    }
    const contexts = [];
    for (const event of events) {
        switch (event.kind) {
            case EventKind.TRADE:
                contexts.push(await getEventContext(event, deps));
                break;
            case EventKind.CREATE:
                contexts.push(await getEventContext(event, deps));
                break;
            case EventKind.UNKNOWN:
                // structured skip — discriminator is logged, not thrown
                console.debug(`[dispatch] skipping unknown discriminator: ${event.discriminator}`);
                break;
        }
    }
    return contexts;
}
export async function fetchOrCreateTxnProcessEvents(options, publish = false, deps = null // default false for genesis/backfill path
) {
    deps = await getDeps(deps);
    const { events, skipped } = await fetchOrCreateClassifiedEvents(options);
    if (skipped > 0) {
        console.debug(`[dispatch] skipped ${skipped} undecodable payloads`);
    }
    const contexts = [];
    for (const event of events) {
        switch (event.kind) {
            case EventKind.TRADE: {
                // processTradeEvent:
                //   1. getEventContext       → resolves log_id, pair_id, meta_id
                //   2. processTradeEventErrorGuard → builds insertParams
                //   3. transactionsService.insertTransactions → writes txn row
                //   4. doEnrich              → publishes or runs pair/meta enrichment
                const ctx = await processTradeEvent(event, deps, publish);
                console.log(event);
                const pair = await deps.transactionsService.insertTransactions(event);
                if (pair) {
                    ctx.pair = pair;
                }
                contexts.push(ctx);
                break;
            }
            case EventKind.CREATE: {
                // processCreateEvent:
                //   1. getEventContext       → resolves log_id, pair_id, meta_id
                //   2. processCreateEventErrorGuard → builds enriched + insertParams
                //   3. metaDataService.insertFromCreateEvent → writes metadata
                //   4. pairsRepo.insert     → writes pair row
                //   5. doEnrich             → publishes or runs enrichment
                const ctx = await processCreateEvent(event, deps, publish);
                const pair = await deps.pairsRepo.upsert(ctx.pair);
                ctx.meta = await deps.metaDataRepo.upsertGenesis(ctx.meta);
                contexts.push(ctx);
                break;
            }
            case EventKind.UNKNOWN:
                console.debug(`[dispatch] skipping unknown discriminator: ${event}`);
                break;
        }
    }
    return contexts;
}
