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
import type { IdLike, FetchContext, PairRow, TransactionEnrichmentContext, CreateContextEnrich, DecodedTradeEvents, DecodedCreateEvents } from '@imports';
import { type AllDeps, type PipelineDeps } from '@repoServices';
export declare function getOrInsertPairIdentity(params: FetchContext, deps?: PipelineDeps | AllDeps | null): Promise<PairRow>;
export declare function getOrInsertMetaIdentity(params: FetchContext, deps?: AllDeps | null): Promise<IdLike>;
export declare function getEventContext(event: DecodedTradeEvents | DecodedCreateEvents, deps?: AllDeps | null): Promise<CreateContextEnrich>;
export declare function doEnrich(ctx: TransactionEnrichmentContext, deps?: AllDeps | null, publish?: boolean): Promise<void>;
export declare function processTradeEvent(event: DecodedTradeEvents, publish?: boolean, deps?: AllDeps | null): Promise<CreateContextEnrich>;
export declare function processCreateEvent(event: DecodedCreateEvents, publish?: boolean, deps?: AllDeps | null): Promise<CreateContextEnrich>;
