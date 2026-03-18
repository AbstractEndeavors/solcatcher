import type {
  RepoResult,
  InsertPairParams
} from './../imports.js'
import {
  LogDataRow,
  TransactionsInsertParams
} from './../imports.js'
import type {
  DecodedCreateEvents,
  DecodedTradeEvents,
  LogIntakePayload,
  EnrichmentContext,
  GenesisEntryPayload,
  EnrichedCreateMetaDataInsert,
  MetaDataEnrichParams,
  CreatePipelineResult,
  TradePipelineResult
} from './../src/index.js';
import {
   type DerivedPDAsResult
   } from '@rateLimiter';
import type {Identity} from '@imports'
import type {ClassifiedEvent,EventsLog,} from './classified.js';

export interface CreateEventEntryPayload extends DecodedCreateEvents {
}
export interface TradeEventEntryPayload extends DecodedTradeEvents {
}
export type QueueName = keyof QueuePayloadMap;
// ═══════════════════════════════════════════════════════════
// QUEUE CONFIG
// ═══════════════════════════════════════════════════════════
export type RetryStrategy = 'requeue' | 'dlq' | 'drop';
export interface QueueConfig<T extends QueueName = QueueName> {
  name: T;
  envKey: string;
  prefetch: number;
  retryStrategy: RetryStrategy;
  maxRetries: number;
  nextQueue?: QueueName | null;
  enabled: boolean,
  worker?: {
    batchSize: number;
    intervalMs: number;
  };
}
// ═══════════════════════════════════════════════════════════
// HANDLER TYPES
// ═══════════════════════════════════════════════════════════
// Handler result - either next payload or null

// ═══════════════════════════════════════════════════════════
// PUBLISHER INTERFACE
// ═══════════════════════════════════════════════════════════
export interface QueuePublisher {
  publish<T extends QueueName>(queue: T, payload: QueuePayloadMap[T]): Promise<void>;
  publishBatch<T extends QueueName>(queue: T, payloads: QueuePayloadMap[T][]): Promise<void>;
}
// Handler signature - takes payload, returns result
// Deps are captured via closure at creation time
export type QueueHandler<T extends QueueName> = (
  payload: QueuePayloadMap[T]
) => Promise<HandlerResult<T>>;
// ═══════════════════════════════════════════════════════════
// VALIDATOR TYPE
// ═══════════════════════════════════════════════════════════
export type PayloadValidator<T> = (x: unknown) => x is T;
// ═══════════════════════════════════════════════════════════
// PROCESS RESULTS
// ═══════════════════════════════════════════════════════════
export interface QueuePayloadMap {
  logIntake: LogIntakePayload;
  logEntry: RepoResult<LogDataRow>;
  txnEntry: ClassifiedEvent[];        // ← input payload, stays
  createEventEntry: DecodedCreateEvents;
  tradeEventEntry: DecodedTradeEvents;
  enrichmentPipelineEntry: EnrichmentContext;
  genesisLookup: GenesisEntryPayload;
  genesisEnrich: Identity;
  onChainMetaDataEnrich: MetaDataEnrichParams;
  offChainMetaDataEnrich: MetaDataEnrichParams;
  metaDataEnrich: MetaDataEnrichParams;
  pairEnrich: Identity;
  pairProvinenceEnrich: Identity;
  transactionInsert:TransactionsInsertParams;
  metaDataGenesisInsert:EnrichedCreateMetaDataInsert;
  pairGenesisInsert:InsertPairParams;
  
}


export interface QueueOutputMap {
  logIntake: RepoResult<LogDataRow>;
  logEntry: ClassifiedEvent[];
  txnEntry: EventsLog;               // ← handler returns EventsLog
  createEventEntry: CreatePipelineResult;
  tradeEventEntry: TradePipelineResult;
  enrichmentPipelineEntry: null;
  genesisLookup: RepoResult<LogDataRow>;
  genesisEnrich: DerivedPDAsResult;
  onChainMetaDataEnrich: MetaDataEnrichParams;
  offChainMetaDataEnrich: MetaDataEnrichParams;
  metaDataEnrich: MetaDataEnrichParams;
  pairEnrich: null;
  pairProvinenceEnrich: null;
  transactionInsert:Identity;
  metaDataGenesisInsert:Identity;
  pairGenesisInsert:Identity;
  
}

// HandlerResult is the *output* — what gets published to the next queue
export type HandlerResult<T extends QueueName> =
  QueueOutputMap[T] | null;


