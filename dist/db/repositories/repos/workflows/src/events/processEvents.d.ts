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
import { type AddressLike, type MintLike } from '@imports';
import type { IdLike, FetchContext, CtxBuild, PairRow, EnrichParams, TransactionEnrichmentContext, CreateContextEnrich } from '@imports';
import type { DecodedTradeEvents, DecodedCreateEvents } from '@repositories/payloads/decode/index.js';
import { type QueuePublisher } from '@imports';
export declare function getOrInsertPairIdentity(this: LogOrchestrator, params: FetchContext): Promise<PairRow>;
export declare function getOrInsertMetaIdentity(this: LogOrchestrator, params: FetchContext): Promise<IdLike>;
export declare function getEventContext(this: LogOrchestrator, event: DecodedTradeEvents | DecodedCreateEvents): Promise<CreateContextEnrich>;
export interface PairEnrichPayload {
    pair?: PairRow;
    id?: IdLike;
    mint?: MintLike;
    pair_id?: IdLike;
    program_id?: AddressLike;
}
export declare function doEnrich(publisher: QueuePublisher, ctx: TransactionEnrichmentContext): Promise<void>;
export declare function processTradeEvent(this: LogOrchestrator, event: DecodedTradeEvents): Promise<CreateContextEnrich>;
export declare function processCreateEvent(this: LogOrchestrator, event: DecodedCreateEvents): Promise<CreateContextEnrich>;
export declare function eventOrchestrator(this: LogOrchestrator, ctx: CtxBuild): Promise<CreateContextEnrich[]>;
export declare function enrichPair(this: LogOrchestrator, params: EnrichParams): Promise<CreateContextEnrich>;
