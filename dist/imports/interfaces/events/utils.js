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
// ============================================================
// INGEST RESULT — the canonical return type of ingest()
// ============================================================
/*export interface IngestResult extends LogPayloadContext {
  /** Classified events decoded at ingest time.
  readonly decoded: PartitionedEvents;

  readonly decode_summary: {
    readonly trade_count: number;
    readonly create_count: number;
    readonly unknown_count: number;
    readonly skipped_count: number;
  };
}*/
// ============================================================
// EMPTY RESULT — for early returns (no payloads, no parsed logs)
// ============================================================
const EMPTY_PARTITION = {
    trades: [],
    creates: [],
    unknowns: [],
};
const EMPTY_SUMMARY = {
    trade_count: 0,
    create_count: 0,
    unknown_count: 0,
    skipped_count: 0,
};
export {};
/*export function emptyIngestResult(
  base: LogPayloadContext
): IngestResult {
  return {
    ...base,
    decoded: EMPTY_PARTITION,
    decode_summary: EMPTY_SUMMARY,
  };
}

// ============================================================
// BUILDER — from LogPayloadContext + DecodeBatchResult
// ============================================================

export function buildIngestResult(
  base: LogPayloadContext,
  batch: DecodeBatchResult,
  partitioned: PartitionedEvents
): IngestResult {
  return {
    ...base,
    decoded: partitioned,
    decode_summary: {
      trade_count: batch.trade_count,
      create_count: batch.create_count,
      unknown_count: batch.unknown_count,
      skipped_count: batch.skipped_count,
    },
  };
}

// ============================================================
// GUARD — does this context carry decoded events?
// ============================================================

export function hasDecodedEvents(
  ctx: LogPayloadContext | IngestResult
): ctx is IngestResult {
  return (
    'decoded' in ctx &&
    ctx.decoded != null &&
    (ctx.decoded.trades.length > 0 ||
      ctx.decoded.creates.length > 0 ||
      ctx.decoded.unknowns.length > 0)
  );
}*/
