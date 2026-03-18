/**
 * INGEST — UPDATED
 *
 * BEFORE:
 *   parse → extract payloads → return { payload_count }
 *   (decode happens later, maybe, in two different places)
 *
 * AFTER:
 *   parse → extract payloads → decode + classify → return IngestResult
 *   (decode happens exactly once, at the right moment, with typed output)
 *
 * The IngestResult carries PartitionedEvents. Every downstream consumer
 * — enricher, orchestrator, queue — receives typed events without
 * touching the registry or re-fetching payloads.
 *
 * If payload_count is 0, we skip decode entirely and return empty events.
 * The decode pass is gated, not unconditional.
 */
import { LogOrchestrator } from './../LogOrchestrator.js';
import type { LogPayloadOptions, IngestResult } from '@imports';
export declare function ingest(this: LogOrchestrator, options: LogPayloadOptions): Promise<IngestResult>;
