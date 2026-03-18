/**
 * INGEST RESULT SCHEMA
 *
 * Extends LogPayloadContext with decoded, classified events.
 *
 * Before: ingest returned { log_id, signature, program_id, slot, payload_count }
 *         and every downstream consumer re-decoded the same payloads.
 *
 * After:  ingest returns IngestResult which carries PartitionedEvents.
 *         Downstream consumers check decoded first, fall back to service.decode()
 *         only if events weren't decoded at ingest time (e.g. re-enrichment of
 *         old data that predates this change).
 *
 * IngestResult is structurally compatible with LogPayloadContext —
 * any consumer that only reads { log_id, signature, ... } still works.
 */
import type { LogPayloadContext } from './imports.js';
import type { PartitionedEvents, DecodeBatchResult } from '@imports';
export interface IngestResult extends LogPayloadContext {
    /** Classified events decoded at ingest time. */
    readonly decoded: PartitionedEvents;
    /** Counts from the decode pass. */
    readonly decode_summary: {
        readonly trade_count: number;
        readonly create_count: number;
        readonly unknown_count: number;
        readonly skipped_count: number;
    };
}
export declare function emptyIngestResult(base: LogPayloadContext): IngestResult;
export declare function buildIngestResult(base: LogPayloadContext, batch: DecodeBatchResult, partitioned: PartitionedEvents): IngestResult;
export declare function hasDecodedEvents(ctx: LogPayloadContext | IngestResult): ctx is IngestResult;
