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
import { emptyIngestResult, buildIngestResult, partitionEvents, } from '@imports';
export async function ingest(options) {
    let { signature, program_id, slot, logData } = options;
    // ── 1. Ensure parsed LogData exists ──
    const log_id = (await this.cfg.logData.parseAndUpsert(options));
    const row = await this.cfg.logData.fetch({ id: log_id });
    const base = {
        log_id,
        signature,
        program_id,
        slot,
        payload_count: 0,
    };
    if (!row) {
        return emptyIngestResult(base);
    }
    signature = row.signature;
    program_id = row.program_id;
    slot = row.slot;
    logData = row;
    const parsed_logs = row?.parsed_logs;
    if (!parsed_logs || !parsed_logs?.length) {
        return emptyIngestResult({ ...base, signature, program_id, slot });
    }
    // ── 2. Extract + insert payloads ──
    const payload_count = await this.cfg.logPayloads.extractAndInsertFromLogData(row);
    const context = {
        log_id,
        signature,
        program_id,
        slot,
        payload_count,
    };
    if (!payload_count) {
        return emptyIngestResult(context);
    }
    // ── 3. Decode + classify (the NEW step) ──
    const batch = await this.cfg.logPayloads.decode(signature);
    const partitioned = partitionEvents(batch.events);
    return buildIngestResult(context, batch, partitioned);
}
