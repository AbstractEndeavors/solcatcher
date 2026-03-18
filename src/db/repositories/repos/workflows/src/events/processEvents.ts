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


import {
  expectSingleRow,
  processTradeEventErrorGuard,
  extractDecodedTradeEventErrorGuard,
  isDecodedResult,
  ensureArray,
  processCreateEventErrorGuard,
  extractDecodedCreateEventErrorGuard,
  getDecodeFromPayload,
  SOLANA_PUMP_FUN_PROGRAM_ID,
  expectRepoValue
} from '@imports';
import type {
  SigLike,
  AddressLike,
  MintLike,
  PairIdParams,
  IdLike,
  FetchContext,
  CtxBuild,
  LogPayloadRow,
  MetaDataRow,
  PairRow,
  EnrichParams,
  TransactionEnrichmentContext,
  CreateContextEnrich,
  DecodedTradeEvents,
  DecodedCreateEvents,
  QueuePublisher,
  GenesisLookupPayload
} from '@imports';
import { LogOrchestrator } from './../../LogOrchestrator.js';
import { getDeps,type AllDeps } from '@repoServices';
// ============================================================
// IDENTITY RESOLUTION — find or create pair/meta stubs
// ============================================================

export async function getOrInsertPairIdentity(
  this: LogOrchestrator,
  params: FetchContext
): Promise<PairRow> {
  let pair = await this.cfg.pairsService.fetch(params);
  if (!pair) {
    const pair_id = (await this.cfg.pairsService.insertIdentity(
      params as PairIdParams
    )) as IdLike;
    pair = await this.cfg.pairsService.fetchById(pair_id);
  }
  return expectSingleRow(pair);
}

export async function getOrInsertMetaIdentity(
  this: LogOrchestrator,
  params: FetchContext
): Promise<IdLike> {
  return await this.cfg.metaDataRepository.assureIdentity(params);
}

// ============================================================
// EVENT CONTEXT — build context for a single decoded event
// ============================================================

export async function getEventContext(
  this: LogOrchestrator,
  event: DecodedTradeEvents | DecodedCreateEvents
): Promise<CreateContextEnrich> {
  const mint: MintLike = event.mint;
  const ctx: CreateContextEnrich = { ...event.provenance, mint };

  const logDataRows = await this.cfg.logDataService.fetchBySignature(ctx.signature);
  const logDataRow = expectRepoValue(logDataRows);

  ctx.program_id = ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
  ctx.slot = logDataRow.slot;
  ctx.log_id = logDataRow.id;
  ctx.pair_id = null;
  ctx.meta_id = null;
  ctx.pairEnrich = false;
  ctx.metaEnrich = false;

  if (mint) {
    const { id: pair_id, needsEnrich: pairEnrich } =
      await this.cfg.pairsRepository.assureIdentityEnrich(ctx);
    const { id: meta_id, needsEnrich: metaEnrich } =
      await this.cfg.metaDataRepository.assureIdentityEnrich(ctx);
    ctx.pair_id = pair_id;
    ctx.meta_id = meta_id;
    ctx.pairEnrich = pairEnrich;
    ctx.metaEnrich = metaEnrich;
  }

  return ctx;
}
export interface PairEnrichPayload {
  pair?: PairRow;
  id?: IdLike;
  mint?: MintLike;
  pair_id?: IdLike;
  program_id?: AddressLike;
}

// ============================================================
// ENRICH DISPATCH — explicit publisher, no hidden singleton
// ============================================================

export async function doEnrich(
  publisher: QueuePublisher,
  ctx: TransactionEnrichmentContext
): Promise<void> {
  if (ctx.pairEnrich) {
    await publisher.publish('genesisLookup', ctx as GenesisLookupPayload);
  }
  if (ctx.metaEnrich) {
    await publisher.publish('metaDataEnrich', ctx);
  }
}

// ============================================================
// TRADE EVENT
// ============================================================

export async function processTradeEvent(
  this: LogOrchestrator,
  event: DecodedTradeEvents
): Promise<CreateContextEnrich> {
  const ctx = await this.getEventContext(event);
  console.log('ctx',ctx)
  const { decoded, enriched, insertParams } = processTradeEventErrorGuard(
    event,
    ctx
  );
  ctx.txn_id = await this.cfg.transactionsService.insertTransactions(insertParams);
  await doEnrich(this.cfg.publisher, ctx);
  return ctx;
}

// ============================================================
// CREATE EVENT
// ============================================================

export async function processCreateEvent(
  this: LogOrchestrator,
  event: DecodedCreateEvents
): Promise<CreateContextEnrich> {
  const ctx = await this.getEventContext(event);
  const { decoded, enriched, insertParams } = processCreateEventErrorGuard(
    event,
    ctx
  );
  await this.cfg.metaDataService.insertFromCreateEvent(enriched.metadata);
  await this.cfg.pairsService.insert(insertParams);
  ctx.pairEnrich = false;
  await doEnrich(this.cfg.publisher, ctx);
  return ctx;
}

// ============================================================
// BATCH ORCHESTRATOR — renamed from eventOrchistrator
//
// Uses Promise.allSettled so one failed payload doesn't kill
// the entire batch. Settled results are logged and filtered.
// ============================================================

interface DecodedPayload {
  payload: LogPayloadRow;
  decoded: {
    name: string;
    category: string;
    data: Record<string, unknown> & { mint: MintLike };
  };
}

export async function eventOrchestrator(
  this: LogOrchestrator,
  ctx: CtxBuild
): Promise<CreateContextEnrich[]> {
  const publisher = this.cfg.publisher;
  const payloads = await this.cfg.logPayloadService.fetchBySignature(ctx.signature);

  // Decode all payloads (CPU-bound, no I/O)
  const decodedPayloads: DecodedPayload[] = ensureArray(payloads)
    .map((payload) => ({
      payload,
      decoded: getDecodeFromPayload(payload),
    }))
    .filter((item): item is DecodedPayload => {
      const d = item.decoded;
      return (
        d !== null &&
        isDecodedResult(d) &&
        d.data?.mint != null &&
        typeof d.data.mint === 'string'
      );
    });

  const mints = [
    ...new Set(decodedPayloads.map((d) => String(d.decoded.data.mint))),
  ];
  if (mints.length === 0) return [];

  // Batch fetch — one round trip per entity type
  const [pairs, metas] = await Promise.all([
    this.cfg.pairsService.fetchBatchByMints(mints,[SOLANA_PUMP_FUN_PROGRAM_ID]),
    this.cfg.metaDataService.fetchBatchByMints(mints,[SOLANA_PUMP_FUN_PROGRAM_ID]),
  ]);

  const pairMap = new Map<string, PairRow>(
    pairs.map((p) => [p.mint as string, p])
  );
  const metaMap = new Map<string, MetaDataRow>(
    metas.map((m) => [m.mint as string, m])
  );

  // Process with allSettled — partial failures are logged, not fatal
  const settled = await Promise.allSettled(
    decodedPayloads.map(async ({ payload, decoded }): Promise<CreateContextEnrich> => {
      const mint = String(decoded.data.mint) as MintLike;
      let pair = pairMap.get(mint as string);
      let meta = metaMap.get(mint as string);

      if (!pair) {
        const pair_id = (await this.cfg.pairsService.insertIdentity({
          mint,
          program_id: ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID,
        })) as IdLike;
        const fetched = await this.cfg.pairsService.fetchById(pair_id);
        if (!fetched) throw new Error(`pair insert→fetch failed: ${pair_id}`);
        pair = fetched;
        pairMap.set(mint as string, pair);
      }

      if (!meta) {
        const meta_id = (await this.cfg.metaDataService.r.insertIdentity({
          mint,
          program_id: ctx.program_id || SOLANA_PUMP_FUN_PROGRAM_ID,
        })) as IdLike;
        const fetched = await this.cfg.metaDataService.r.fetchById(meta_id);
        if (!fetched) throw new Error(`meta insert→fetch failed: ${meta_id}`);
        meta = fetched;
        metaMap.set(mint as string, meta);
      }

      const buildCtx: CreateContextEnrich = {
        signature: ctx.signature,
        program_id:
          ctx.program_id || pair.program_id || SOLANA_PUMP_FUN_PROGRAM_ID,
        slot: ctx.slot,
        log_id: ctx.log_id,
        invocation: payload.invocation_index,
        mint,
        pair_id: pair.id,
        meta_id: meta.id,
      };

      const { success: isTrade, data: tradeDecoded } =
        extractDecodedTradeEventErrorGuard(decoded);

      if (isTrade && tradeDecoded) {
        const { insertParams } = processTradeEventErrorGuard(
          tradeDecoded,
          buildCtx
        );
        buildCtx.txn_id = await this.cfg.transactionsService.insertTransactions(
          insertParams
        );
      } else {
        const { success: isCreate, data: createDecoded } =
          extractDecodedCreateEventErrorGuard(decoded);
        if (isCreate && createDecoded) {
          const { enriched, insertParams } = processCreateEventErrorGuard(
            createDecoded,
            buildCtx
          );
          await this.cfg.metaDataService.insertFromCreateEvent(enriched.metadata);
          await this.cfg.pairsService.insert({ meta_id: meta.id, ...insertParams });
          await publisher.publish('pairEnrich', buildCtx as any);
        }
      }

      return buildCtx;
    })
  );

  // Log failures, collect successes
  const results: CreateContextEnrich[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
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

export async function enrichPair(
  this: LogOrchestrator,
  params: EnrichParams,
  deps:AllDeps
): Promise<CreateContextEnrich> {
  const ctx = await buildEnrichmentContext(deps, params);
  // Import pipeline runner — the pipeline itself is still defined
  // in the enricher module, but deps are now explicit
  const { ENRICHMENT_PIPELINE, runEnrichmentPipeline } = await import(
    '../enricher/index.js'
  );

  await runEnrichmentPipeline(ENRICHMENT_PIPELINE, ctx, deps);

  return ctx as EnrichParams;
}
