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
export {};
