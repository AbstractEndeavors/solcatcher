/**
 * FETCH + INSERT TRANSACTION — UPDATED
 *
 * Same decode-at-ingest pattern as ingest.ts.
 * fetchOrCreate returns IngestResult when it creates new data.
 * fetchAndInsertTransaction returns IngestResult with decoded events.
 */
import { LogOrchestrator } from './../LogOrchestrator.js';
import type { LogDataRow, SigLike, LogPayloadOptions, AddressLike } from '@imports';
import { type IngestResult } from '@imports';
export declare function fetchOrLoopTransaction(this: LogOrchestrator, deps: LogPayloadOptions): Promise<void>;
export declare function fetchOrCreate(this: LogOrchestrator, options: LogPayloadOptions): Promise<LogDataRow | LogDataRow[] | null>;
export declare function fetchAndInsertTransaction(this: LogOrchestrator, signature: SigLike, program_id?: AddressLike): Promise<IngestResult>;
