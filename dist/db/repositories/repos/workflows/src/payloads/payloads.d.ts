/**
 * PAYLOAD ORCHESTRATOR METHODS
 *
 * Bound to LogOrchestrator via bindRepo.
 *
 * fetchAndDecodeInsertLogDataPayloads:
 *   For the logEntry handler path. The row already exists (logIntake stored
 *   raw logs_b64 without parsing). This method:
 *     1. Fetches the stored row by id/signature
 *     2. Decodes logs_b64 → log line array
 *     3. parseProgramLogs → invocation tree
 *     4. processParsedLogs → LogPayloadBatchItem[]
 *     5. insertBatch → stores payloads in DB
 *     6. service.decode(signature) → ClassifiedEvent[]
 *     7. Returns IngestResult with decoded events
 *
 *   Does NOT delegate to ingestLogData. That path calls parseAndUpsert
 *   which short-circuits when the row already exists, leaving parsed_logs
 *   null and payload_count at 0.
 *
 * getLogPayloadContext:
 *   Fetches log data row → returns minimal context for event orchestration.
 *   Used by txnEntry handler on the slow path (re-processing / backfill).
 */
import { LogOrchestrator } from './../LogOrchestrator.js';
import type { LogPayloadContext, SigLike, IdLike, LogEntryPayload } from '@imports';
import { type IngestResult } from '@imports';
export declare function DecodeInsertLogDataPayloads(this: LogOrchestrator, options: LogEntryPayload): Promise<IngestResult>;
export declare function fetchAndDecodeInsertLogDataPayloads(this: LogOrchestrator, options: LogEntryPayload): Promise<IngestResult>;
export declare function getLogPayloadContext(this: LogOrchestrator, params: {
    id?: IdLike;
    log_id?: IdLike;
    signature?: SigLike;
}): Promise<LogPayloadContext & {
    id: IdLike;
}>;
