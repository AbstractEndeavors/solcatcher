import type { MintLike, IdLike, AddressLike, PairRow } from './imports.js';
import type { LogIntakePayload, MetaDataEnrichParams } from './enrich/index.js';
import type { SigLike, StringLike, LogDataRow, RepoResult, EnrichmentContext } from '@imports';
import { type DecodedTradeEvents, type DecodeProvenance, EventKind } from './trade/index.js';
import type { DecodedCreateEvents } from './create/index.js';
import type { TradeEventEntryPayload, CreateEventEntryPayload } from '@Pipeline/src/queues/definitions.js';
export interface PairIngestPayload {
    pair?: PairRow;
    id?: IdLike;
    mint?: string;
    pair_id?: IdLike;
}
export interface DecodedUnknownEvent {
    readonly kind: typeof EventKind.UNKNOWN;
    readonly provenance: DecodeProvenance;
    readonly discriminator: string;
    readonly raw: Record<string, unknown>;
}
export interface PairEnrichPayload {
    pair?: PairRow;
    id?: IdLike;
    mint?: MintLike;
    pair_id?: IdLike;
    program_id?: AddressLike;
}
export type ProcessResultKind = 'trade' | 'create' | 'unknown' | 'error' | 'empty';
export interface ProcessResult {
    kind: string;
    log_id: IdLike;
    pair_id?: IdLike;
    meta_id?: IdLike;
    txn_id?: IdLike;
    error?: string;
}
export interface MetaEnrichPayload {
    meta_id?: IdLike;
    mint?: MintLike;
    program_id?: AddressLike;
    uri?: StringLike;
}
export interface GenesisLookupPayload {
    pair_id: IdLike;
    mint: MintLike;
    program_id: AddressLike;
}
export interface EnrichmentTask {
    queue: 'pairEnrich' | 'metaEnrich' | 'genesisLookup';
    payload: PairEnrichPayload | MetaEnrichPayload | GenesisLookupPayload;
}
export interface QueuePayloadMap {
    logIntake: LogIntakePayload;
    logEntry: RepoResult<LogDataRow>;
    txnEntry: ClassifiedEvent[];
    createEventEntry: CreateEventEntryPayload;
    tradeEventEntry: TradeEventEntryPayload;
    enrichmentPipelineEntry: EnrichmentContext;
    genesisLookup: GenesisLookupPayload;
    onChainMetaDataEnrich: MetaDataEnrichParams;
    offChainMetaDataEnrich: MetaDataEnrichParams;
    metaDataEnrich: MetaDataEnrichParams;
}
export interface QueuePayloads {
    logIntake: LogIntakePayload;
    logEntry: RepoResult<LogDataRow>;
    txnEntry: ClassifiedEvent[];
    createEventEntry: CreateEventEntryPayload;
    tradeEventEntry: TradeEventEntryPayload;
    enrichmentPipelineEntry: EnrichmentContext;
    genesisLookup: GenesisLookupPayload;
    onChainMetaDataEnrich: MetaDataEnrichParams;
    offChainMetaDataEnrich: MetaDataEnrichParams;
    metaDataEnrich: MetaDataEnrichParams;
}
export type QueueName = keyof QueuePayloadMap;
export type RetryStrategy = 'requeue' | 'dlq' | 'drop';
export interface QueueConfig<T extends QueueName = QueueName> {
    name: T;
    envKey: string;
    prefetch: number;
    retryStrategy: RetryStrategy;
    maxRetries: number;
    nextQueue?: QueueName | null;
    enabled: boolean;
    worker?: {
        batchSize: number;
        intervalMs: number;
    };
}
export type HandlerResult<T extends QueueName> = QueuePayloadMap[QueueName] | null;
export interface QueuePublisher {
    publish<T extends QueueName>(queue: T, payload: QueuePayloadMap[T]): Promise<void>;
    publishBatch<T extends QueueName>(queue: T, payloads: QueuePayloadMap[T][]): Promise<void>;
}
export type QueueHandler<T extends QueueName> = (payload: QueuePayloadMap[T]) => Promise<HandlerResult<T>>;
export type PayloadValidator<T> = (x: unknown) => x is T;
export type ClassifiedEvent = DecodedTradeEvents | DecodedCreateEvents | DecodedUnknownEvent;
export interface DecodeBatchResult {
    readonly signature: SigLike;
    readonly events: ClassifiedEvent[];
    readonly trade_count: number;
    readonly create_count: number;
    readonly unknown_count: number;
    readonly skipped_count: number;
}
export declare function isTradeEvent(e: ClassifiedEvent): e is DecodedTradeEvents;
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.

export function extractDecodedTradeEvent(
  raw: unknown
): DecodedTradeEvents | null {
  if (!isTradeEvent(raw)) {
    return null;
  }
  
  if (!isDecodedTradeEventData(raw.data)) {
    console.warn(
      'extractDecodedTradeEvent: data shape invalid',
      raw.data
    );
    return null;
  }
  
  return raw.data;
}
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.

export function extractDecodedTradeEventErrorGuard(
  raw: unknown
):{success:BoolLike,data: DecodedTradeEvents | null | DataLike}{
  if (!isTradeEvent(raw)) {
    return {success:null,data:null};
  }
  let success = true
  let data = raw.data
  if (data.decodable == false){
    success=false
  }
  return {success,data}
}
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid TradeEvent.
 * Throws if DB validation fails (indicates bug in pipeline).
 */
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid CreateEvent.

export function processTradeEvent(
raw: unknown,
ctx: TransactionEnrichmentContext
): TradePipelineResult | null {
// Layer 1: Extract
const decoded = extractDecodedTradeEvent(raw);
if (!decoded) {
  return null;
}
if (!ctx.program_id) {
throw new Error(`Missing program_id in TradePipelineContext`);
}
// Layer 2: Enrich
const enriched = enrichTradeEvent(decoded, ctx);

// Layer 3: To DB params
const insertParams = toInsertParams(enriched);

// Gate check (should never fail if pipeline is correct)
if (!isDbSafeInsertTransactionsParams(insertParams)) {
  throw new Error(
    `processTradeEvent: insertParams failed DB validation. ` +
    `signature=${ctx.signature}. This indicates a bug in the pipeline.`
  );
}
return { decoded, enriched, insertParams };
}
export function isCreateEvent(e: ClassifiedEvent): e is DecodedCreateEvents {
return e.kind === EventKind.CREATE;
}*/
export declare function isUnknownEvent(e: ClassifiedEvent): e is DecodedUnknownEvent;
export interface PartitionedEvents {
    trades: DecodedTradeEvents[];
    creates: DecodedCreateEvents[];
    unknowns: DecodedUnknownEvent[];
}
export declare function partitionEvents(events: ClassifiedEvent[]): PartitionedEvents;
