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
import { getIdOrNull, expectSingleRow, parseProgramLogs, processParsedLogs } from '@imports';
import { emptyIngestResult, buildIngestResult, partitionEvents, } from '@imports';
export async function DecodeInsertLogDataPayloads(options) {
    let { signature, log_id, id, logs_b64, slot, program_id } = options;
    let context = {
        log_id: null,
        signature: signature,
        program_id: program_id,
        slot: slot,
        payload_count: 0,
    };
    let parsedLogs;
    if (!logs_b64) {
        let raw;
        const lookupId = id || log_id;
        raw = await this.cfg.logData.fetch({ id: lookupId, signature });
        const row = expectSingleRow(raw);
        if (row) {
            parsedLogs = row.parsed_logs;
            context.log_id = log_id || id || getIdOrNull(row);
            context.signature = signature || row.signature;
            context.program_id = program_id || row.program_id;
            context.slot = slot || row.slot;
            logs_b64 = row.logs_b64;
            if (!row || (!parsedLogs || !parsedLogs.length)) {
                return emptyIngestResult(context);
            }
        }
    }
    let logLines;
    if (logs_b64) {
        // ── 1. Fetch the already-stored log data row ──
        const decoded = Buffer.from(logs_b64, 'base64').toString('utf-8');
        // logs_b64 can be either JSON array or newline-delimited text
        try {
            const parsed = JSON.parse(decoded);
            logLines = Array.isArray(parsed) ? parsed : decoded.split('\n');
        }
        catch {
            logLines = decoded.split('\n');
        }
        parsedLogs = parseProgramLogs(logLines);
    }
    if (!parsedLogs || !parsedLogs.length) {
        return emptyIngestResult(context);
    }
    // ── 3. Extract payloads from invocation tree ──
    const payloads = processParsedLogs(signature, parsedLogs);
    if (!payloads.length) {
        return emptyIngestResult(context);
    }
    // ── 4. Insert payloads ──
    await this.cfg.logPayloads.insertBatch(payloads);
    context.payload_count = payloads.length;
    // ── 5. Decode + classify ──
    const batch = await this.cfg.logPayloads.decode(signature);
    const partitioned = partitionEvents(batch.events);
    return buildIngestResult(context, batch, partitioned);
}
// ============================================================
// fetchAndDecodeInsertLogDataPayloads
// ============================================================
export async function fetchAndDecodeInsertLogDataPayloads(options) {
    let { signature, log_id, id, logs_b64, slot, program_id } = options;
    let context = {
        log_id: null,
        signature: signature,
        program_id: program_id,
        slot: slot,
        payload_count: 0,
    };
    // ── 1. Fetch the already-stored log data row ──
    const lookupId = id || log_id;
    let raw;
    if (!logs_b64) {
        if (lookupId) {
            raw = await this.cfg.logData.fetch({ id: lookupId });
        }
        if (!raw && options.signature) {
            raw = await this.cfg.logData.fetchBySignature(options.signature);
        }
        const row = expectSingleRow(raw);
        if (!row) {
            return emptyIngestResult({
                log_id: lookupId ?? null,
                signature: options.signature,
                program_id: options.program_id ?? null,
                slot: options.slot ?? null,
                payload_count: 0,
            });
        }
        context.log_id = log_id || id || getIdOrNull(row);
        context.signature = signature || row.signature;
        context.program_id = program_id || row.program_id;
        context.slot = slot || row.slot;
        logs_b64 = row.logs_b64;
        // ── 2. Get log lines: prefer parsed_logs, fall back to logs_b64 ──
        let parsedLogs = row.parsed_logs;
        logs_b64 = row.logs_b64;
        if (!parsedLogs || !parsedLogs.length) {
            // logIntake stored raw logs_b64 without parsing — decode it here
            if (!row.logs_b64) {
                return emptyIngestResult(context);
            }
        }
    }
    const decoded = Buffer.from(logs_b64, 'base64').toString('utf-8');
    // logs_b64 can be either JSON array or newline-delimited text
    let logLines;
    try {
        const parsed = JSON.parse(decoded);
        logLines = Array.isArray(parsed) ? parsed : decoded.split('\n');
    }
    catch {
        logLines = decoded.split('\n');
    }
    logLines = logLines.filter(Boolean);
    if (!logLines.length) {
        return emptyIngestResult(context);
    }
    // Parse log lines → invocation tree
    let parsedLogs = parseProgramLogs(logLines);
    if (!parsedLogs || !parsedLogs.length) {
        return emptyIngestResult(context);
    }
    // ── 3. Extract payloads from invocation tree ──
    const payloads = processParsedLogs(signature, parsedLogs);
    if (!payloads.length) {
        return emptyIngestResult(context);
    }
    // ── 4. Insert payloads ──
    await this.cfg.logPayloads.insertBatch(payloads);
    context.payload_count = payloads.length;
    // ── 5. Decode + classify ──
    const batch = await this.cfg.logPayloads.decode(signature);
    const partitioned = partitionEvents(batch.events);
    return buildIngestResult(context, batch, partitioned);
}
// ============================================================
// getLogPayloadContext
// ============================================================
export async function getLogPayloadContext(params) {
    const lookupId = params.id ?? params.log_id;
    let row;
    if (lookupId) {
        row = await this.cfg.logData.fetch({ id: lookupId });
    }
    if (!row && params.signature) {
        row = await this.cfg.logData.fetchBySignature(params.signature);
    }
    row = expectSingleRow(row);
    const id = getIdOrNull(row);
    return {
        id,
        log_id: id,
        signature: row.signature,
        program_id: row.program_id,
        slot: row.slot,
        payload_count: 0,
    };
}
