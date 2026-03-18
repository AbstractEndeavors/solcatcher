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
import type {
  DecodedTradeEvents,
  DecodedCreateEvents,
  CreatePipelineResult,
  TradePipelineResult,
  InsertPairParams,
  EnrichedCreateMetaDataInsert,
  TransactionsInsertParams
} from '@imports';
import {
  processTradeEventErrorGuard,
  processCreateEventErrorGuard,
} from '@imports';
import {metaDataGenesisInsert} from './../metaData/index.js';
import {pairGenesisInsert} from './../pairs/index.js';
import {transactionInsert} from './../txn/index.js';
import {type AllDeps } from '@db';
import {getEventContext} from './../utils/index.js';
// ============================================================
// TRADE EVENT
// ============================================================

export async function processTradeEvent(
  event: DecodedTradeEvents,
  deps: AllDeps,
  publish:boolean=true
): Promise<TradePipelineResult> {                       // resolve once

  const ctx = await getEventContext(event, deps);      // pass resolved deps
  const pipelineResult = processTradeEventErrorGuard(event, ctx);
  const txnInsertParams = pipelineResult.insertParams as TransactionsInsertParams
  if (publish){
    await deps.publisher.publish('transactionInsert',txnInsertParams);
  }else{
    pipelineResult.result.txn_id = await transactionInsert(txnInsertParams,deps);
  }
  return pipelineResult;
}
// ============================================================
// CREATE EVENT
// ============================================================

export async function processCreateEvent(
  event: DecodedCreateEvents,
  deps: AllDeps,
  publish:boolean=true
): Promise<CreatePipelineResult> {
  const ctx = await getEventContext(event,deps);
  const pipelineResult= processCreateEventErrorGuard(event,ctx);
  const metaInsertParams = pipelineResult.enriched.metadata as EnrichedCreateMetaDataInsert
  const pairInsertParams = pipelineResult.insertParams as InsertPairParams
  if (publish){
    await deps.publisher.publish('metaDataGenesisInsert',metaInsertParams);
    await deps.publisher.publish('pairGenesisInsert',pairInsertParams);
    
  }else{
    await metaDataGenesisInsert(metaInsertParams,deps);
    await pairGenesisInsert(pairInsertParams,deps);  // <-- was insert
  }

  return pipelineResult;
}

