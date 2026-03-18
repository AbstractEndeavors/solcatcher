// src/pipeline/handlers/txnEntry.ts
//
// UPDATED: Two paths based on what arrives from the queue.
//
// Fast path (normal flow):
//   logEntry returns IngestResult → txnEntry receives it with decoded events
//   → decodePayloads() sees hasDecodedEvents → routes pre-decoded trades/creates
//   → zero re-fetch, zero re-decode
//
// Slow path (re-processing, manual trigger):
//   payload is plain { id, signature } → getLogPayloadContext → eventOrchistrator
//   → full decode from DB
// src/pipeline/handlers/logEntry.ts
import {
  type DecodedTradeEvents,
  type DecodedCreateEvents,
  type EnrichmentContext,
  type ClassifiedEvent,
  type QueueHandler,
  type RepoResult,
  type LogDataRow,
  type GenesisEntryPayload,
  type Identity,
  type LogIntakePayload,
  type InsertPairParams,
  type EnrichedCreateMetaDataInsert,
  type TransactionsInsertParams,
} from '@imports';
import {type AllDeps } from '@db';
import {
  genesisLookup,
  onchainEnrich,
  offChainEnrich,
  genesisEnrichPdas,
  processCreateEvent,
  processTradeEvent,
  txnEntry,
  repoResultToClassifiedEvents,
  pairProvinenceEnrich,
  pairEnrichment,
  metaDataEnrichment,
  transactionInsert,
  metaDataGenesisInsert,
  pairGenesisInsert
} from './src/index.js'
export async function runEnrichmentPipeline(
  payload: EnrichmentContext,
  deps: AllDeps
): Promise<null> {
  const mint = payload.mint as string;

  const pairDone = !mint || deps.cache.isPairComplete(mint);
  const metaDone = !mint || deps.cache.isMetaComplete(mint);

  if (!pairDone) await deps.publisher.publish('pairEnrich', payload as Identity);
  if (!metaDone) await deps.publisher.publish('metaDataEnrich', payload as Identity);

  return null;
}
export function createGenesisLookupHandler(
  deps: AllDeps
): QueueHandler<'genesisLookup'> {
  return async (payload: GenesisEntryPayload) => {
    return await genesisLookup(payload,deps);
  }
}

export function createGenesisEnrichHandler(
  deps: AllDeps
): QueueHandler<'genesisEnrich'> {
  return async (payload: Identity) => {
    return await genesisEnrichPdas(payload,deps);
  }
}
export function createEnrichmentPipelineHandler(
    deps: AllDeps
): QueueHandler<'enrichmentPipelineEntry'> {
  return async (payload:EnrichmentContext) => {
    return await runEnrichmentPipeline(payload,deps);
  };
}
export function createTradeEventEntryHandler(
    deps: AllDeps
): QueueHandler<'tradeEventEntry'> {
  return async (payload: DecodedTradeEvents) => {
    // Store raw log data     
    return await processTradeEvent(payload,deps);
  };
}
export function createCreateEventEntryHandler(
    deps: AllDeps 
): QueueHandler<'createEventEntry'> {
  return async (payload: DecodedCreateEvents) => {
    return await processCreateEvent(payload,deps);
  };
}
export function createTxnEntryHandler(
    deps: AllDeps
): QueueHandler<'txnEntry'> {
  return async (payload: ClassifiedEvent[]) => {
    return await txnEntry(payload,deps)
  };
}
export function createLogEntryHandler(   
  deps: AllDeps
): QueueHandler<'logEntry'> {
  return async (result: RepoResult<LogDataRow>,) => {
    return await repoResultToClassifiedEvents(result,deps)
  };
}


export function createLogIntakeHandler(
    deps: AllDeps)
    : QueueHandler<'logIntake'> {
  return async (payload: LogIntakePayload) => {
    return await deps.logDataRepo.insert(payload);
  };
}

export function createPairProvinenceEnrichHandler(deps: AllDeps): QueueHandler<'pairProvinenceEnrich'> {
  return async (payload: Identity) => {
    return await pairProvinenceEnrich(payload,deps)
  };
}
export function createPairEnrichHandler(deps: AllDeps): QueueHandler<'pairEnrich'> {
  return async (payload: Identity) => {
    return await pairEnrichment(payload,deps)
  };
}

/* -------------------------------------------------- */
/* Handler factory                                    */
/* -------------------------------------------------- */

export function createOnChainMetaDataEnrichHandler(
  deps: AllDeps
): QueueHandler<'onChainMetaDataEnrich'> {
  return (payload: Identity) => onchainEnrich(payload, deps);
}
/* -------------------------------------------------- */
/* Handler factory                                    */
/* -------------------------------------------------- */

export function createOffChainMetaDataEnrichHandler(
  deps: AllDeps
): QueueHandler<'offChainMetaDataEnrich'> {
  return (payload: Identity) => offChainEnrich(payload, deps);
}

/* -------------------------------------------------- */
/* Handler factory                                    */
/* -------------------------------------------------- */

export function createMetaDataEnrichHandler(
  deps: AllDeps
): QueueHandler<'metaDataEnrich'> {
  return (payload: Identity) => metaDataEnrichment(payload, deps);
}

export function createPairGenesisInsertHandler(
  deps: AllDeps
): QueueHandler<'pairGenesisInsert'> {
  return (payload: InsertPairParams) => pairGenesisInsert(payload, deps);
}

export function createMetaDataGenesisInsertHandler(
  deps: AllDeps
): QueueHandler<'metaDataGenesisInsert'> {
  return (payload: EnrichedCreateMetaDataInsert) => metaDataGenesisInsert(payload, deps);
}

export function createTransactionInsertHandler(
  deps: AllDeps
): QueueHandler<'transactionInsert'> {
  return (payload: TransactionsInsertParams) => transactionInsert(payload, deps);
}
