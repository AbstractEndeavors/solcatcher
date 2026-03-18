/**
 * FETCH + INSERT TRANSACTION — UPDATED
 *
 * Same decode-at-ingest pattern as ingest.ts.
 * fetchOrCreate returns IngestResult when it creates new data.
 * fetchAndInsertTransaction returns IngestResult with decoded events.
 */

import { LogOrchestrator } from './../../LogOrchestrator.js';
import type {
  LogDataRow,
  SigLike,
  LogPayloadContext,
  LogPayloadOptions,
  AddressLike,
  LogIntakePayload
} from '@imports';
'./enrich/index.js'
import { fetchTransaction } from '@rateLimiter';
import { expectRepoValue, isSignature, SOLANA_PUMP_FUN_PROGRAM_ID,transformSolanaTransaction } from '@imports';
import {
  type IngestResult,
  
  emptyIngestResult,
  buildIngestResult,
  partitionEvents,
} from '@imports';
import { getDeps} from '@repoServices';
export async function fetchOrLoopTransaction(
  this: LogOrchestrator,
  options: LogPayloadOptions
): Promise<void> {
    // Try fetch first
    let rows = await this.cfg.logDataService.fetch(options);
    

    if (!rows.ok) {
      const signature: SigLike = options.signature;
      if (isSignature(signature)){
        const tx = await fetchTransaction({ signature, encoding: 'base64' });
        const insertData:LogIntakePayload = transformSolanaTransaction({signature, tx});

        await this.cfg.logPayloadService.extractAndInsertTxnData(insertData);
        await this.cfg.publisher.publish('logIntake',insertData)

    }
  }
}

export async function fetchOrCreate(
  this: LogOrchestrator,
  options: LogPayloadOptions
): Promise<LogDataRow | LogDataRow[] | null> {
  // Try fetch first
  const existing = await this.cfg.logDataService.fetch(options);
  if (existing) {
    return existing;
  }

  const signature: SigLike = options.signature;
  const program_id: AddressLike = options.program_id;

  if (!isSignature(signature)) {
    return null;
  }

  await this.fetchAndInsertTransaction(signature, program_id);
  const row = await this.cfg.logDataService.fetchBySignature(signature);
  if (!row) {
    throw new Error('Failed to fetch inserted row');
  }
  return row;
}

export async function fetchAndInsertTransaction(
  this: LogOrchestrator,
  signature: SigLike,
  program_id?: AddressLike
): Promise<IngestResult> {
  // Fetch transaction
  const response = await fetchTransaction({ signature, encoding: 'base64' });
  if (!response) {
    throw new Error(`Transaction not found: ${signature}`);
  }

  response.signature = response.signature || signature;
  response.program_id =
    response.program_id || program_id || SOLANA_PUMP_FUN_PROGRAM_ID;

  // Transform + insert log data
  const insertData = transformSolanaTransaction(signature, response);
  const log_id = await this.cfg.logData.insert(insertData);

  // Extract payloads
  const payload_count =
    await this.cfg.logPayloads.extractAndInsertTxnData(response);

  const context: LogPayloadContext = {
    log_id,
    signature,
    program_id: response.program_id,
    slot: response.slot,
    payload_count,
  };

  if (!payload_count) {
    return emptyIngestResult(context);
  }

  // ── Decode + classify (same pattern as ingest) ──
  const batch = await this.cfg.logPayloads.decode(signature);
  const partitioned = partitionEvents(batch.events);

  return buildIngestResult(context, batch, partitioned);
}
