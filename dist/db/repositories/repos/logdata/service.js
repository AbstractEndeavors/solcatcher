/**
 * LOG DATA SERVICE
 *
 * Service layer for log data operations.
 * Explicit wiring, no hidden state, queue-based batching.
 *
 * Pattern: Explicit dependencies over smart defaults
 * Return: RepoResult<T> throughout — no raw nulls, no throws at boundary
 */
import { LogDataRepository } from './repository/index.js';
import { createBatchBuffer, BatchBuffer } from './batch-queue.js';
import { fetchTransaction } from '@rateLimiter';
import { LogDataRow, InsertLogDataParams, MarkProcessedBatchParams, UpdateLogEnrichmentParams, Buffer, isSignature, firstRowOrNull, isId, isTruthyBool, parseProgramLogs, expectSingleRow, } from '@imports';
import { fetchTxnInsertData } from '@limiter-server';
// ============================================================
// UTILS
// ============================================================
export function decodeLogsB64(logs_b64) {
    if (!logs_b64 || typeof logs_b64 !== 'string') {
        throw new Error('decodeLogsB64: logs_b64 must be a base64 string');
    }
    const decoded = Buffer.from(logs_b64, 'base64').toString('utf8');
    return decoded.split('\n').filter((line) => line.trim().length > 0);
}
// ============================================================
// SERVICE
// ============================================================
export class LogDataService {
    /** Direct repo access for callers that don't need service-level logic */
    r;
    insertBuffer;
    constructor(config) {
        this.r = new LogDataRepository(config.db);
        this.insertBuffer = createBatchBuffer((batch) => this.processBatch(batch), {
            batchSize: config.batchSize ?? 100,
            maxDelayMs: config.maxDelayMs ?? 50,
            hardCap: config.hardCap ?? 500,
        });
    }
    // ────────────────────────────────────────────────────────
    // LIFECYCLE
    // ────────────────────────────────────────────────────────
    async start() {
        const result = await this.r.createTable();
        if (!result.ok)
            return result;
        this.insertBuffer.start();
        return { ok: true, value: null };
    }
    async stop() {
        await this.insertBuffer.stop();
    }
    // ────────────────────────────────────────────────────────
    // INSERT (with batching)
    // ────────────────────────────────────────────────────────
    /** Queued for batching — returns immediately */
    enqueueInsert(params) {
        this.insertBuffer.enqueue(params);
    }
    /** Immediate insert, bypasses queue */
    async insert(params) {
        return await this.r.insert(params);
    }
    async insertIntent(signature) {
        return await this.r.insertIntent(signature);
    }
    async insertBatch(rows) {
        return await this.r.insertBatch(rows);
    }
    async flush() {
        await this.insertBuffer.flush();
    }
    // ────────────────────────────────────────────────────────
    // QUERY
    // ────────────────────────────────────────────────────────
    async fetch(params) {
        return await this.r.fetch(params);
    }
    async fetchById(id) {
        return await this.r.fetchById(id);
    }
    async fetchBySignature(signature) {
        return await this.r.fetchBySignature(signature);
    }
    async fetchByLimit(params) {
        return await this.r.fetchByLimit(params);
    }
    // ────────────────────────────────────────────────────────
    // UPDATE
    // ────────────────────────────────────────────────────────
    async update(params) {
        return await this.r.update(params);
    }
    async upsertParsedLogs(params) {
        return await this.r.upsertParsedLogs(params);
    }
    // ────────────────────────────────────────────────────────
    // PARSE & UPSERT — private composition helpers
    //
    // These unwrap internally — they are not the public boundary.
    // Errors propagate as thrown exceptions caught by the public
    // methods, which convert them to RepoResult.
    // ────────────────────────────────────────────────────────
    async ensureCanonicalRow(input) {
        const { id, signature, logData } = input;
        if (isId(id)) {
            const result = await this.r.fetchById(id);
            if (!result.ok)
                throw new Error(`fetchById failed: ${result.reason}`);
            if (!result.value)
                throw new Error(`No row for id ${id}`);
            return result.value;
        }
        if (isSignature(signature)) {
            const result = await this.r.fetchBySignature(signature);
            if (!result.ok)
                throw new Error(`fetchBySignature failed: ${result.reason}`);
            if (!result.value)
                throw new Error(`No row for signature ${signature}`);
            return result.value;
        }
        if (logData) {
            if (!isSignature(logData.signature)) {
                throw new Error('External logData missing signature');
            }
            const existing = await this.r.fetchBySignature(logData.signature);
            if (!existing.ok)
                throw new Error(`fetchBySignature failed: ${existing.reason}`);
            if (existing.value)
                return existing.value;
            const inserted = await this.r.insert(logData);
            if (!inserted.ok)
                throw new Error(`insert failed: ${inserted.reason}`);
            if (!inserted.value)
                throw new Error('insert returned no row');
            // insert already refetches — return the value directly
            return inserted.value;
        }
        return null;
    }
    async parseIfNeeded(row) {
        if (row.parsed_logs)
            return row.id;
        if (typeof row.logs_b64 !== 'string') {
            throw new Error(`Row ${row.id} missing logs_b64`);
        }
        const logs = decodeLogsB64(row.logs_b64);
        const parsed = parseProgramLogs(logs);
        const result = await this.r.upsertParsedLogs({ id: row.id, parsed_logs: parsed });
        if (!result.ok)
            throw new Error(`upsertParsedLogs failed: ${result.reason}`);
        if (!result.value)
            throw new Error(`upsertParsedLogs returned no id for row ${row.id}`);
        return result.value;
    }
    // ────────────────────────────────────────────────────────
    // PARSE & UPSERT — public
    // ────────────────────────────────────────────────────────
    async parseAndUpsert(options) {
        try {
            const row = await this.ensureCanonicalRow(options);
            if (!row)
                return { ok: true, value: null };
            const id = await this.parseIfNeeded(row);
            if (isTruthyBool(options.returnRow)) {
                const fetched = await this.r.fetchById(id);
                if (!fetched.ok)
                    return fetched;
                return { ok: true, value: fetched.value };
            }
            return { ok: true, value: row };
        }
        catch (err) {
            return { ok: false, value: null, reason: "parse_and_upsert_failed", meta: { err: String(err) } };
        }
    }
    // ────────────────────────────────────────────────────────
    // FETCH OR CREATE
    // ────────────────────────────────────────────────────────
    async fetchOrCreate(params) {
        try {
            const existing = await this.r.fetch(params);
            if (existing.ok)
                return existing;
            if (existing.value != null)
                return existing;
            const signature = params?.signature;
            if (!isSignature(signature)) {
                return { ok: true, value: null };
            }
            const logData = await fetchTxnInsertData({ signature });
            await this.parseAndUpsert(logData);
            const row = await this.r.fetch({ signature });
            if (!row.ok)
                return row;
            if (!row.value) {
                return { ok: false, value: null, reason: "row_not_found_after_insert", meta: { signature } };
            }
            return { ok: true, value: row.value };
        }
        catch (err) {
            return { ok: false, value: null, reason: "fetch_or_create_failed", meta: { err: String(err) } };
        }
    }
    async fetchOrCreateParsed(params) {
        try {
            const raw = await this.fetchOrCreate(params);
            if (!raw.ok)
                return raw;
            // 🔑 Collapse union HERE
            const logData = firstRowOrNull(raw.value);
            if (!logData) {
                return { ok: true, value: null };
            }
            const parsed = await this.parseAndUpsert({
                logData,
                returnRow: true,
            });
            if (!parsed.ok)
                return parsed;
            if (!parsed.value)
                return { ok: true, value: null };
            return { ok: true, value: parsed.value };
        }
        catch (err) {
            return {
                ok: false,
                value: null,
                reason: 'fetch_or_create_parsed_failed',
                meta: { err: String(err) },
            };
        }
    }
    // ────────────────────────────────────────────────────────
    // MARK SORTED / PROCESSED
    // ────────────────────────────────────────────────────────
    async markSorted(params) {
        return await this.r.markSorted(params);
    }
    async markSortedBatch(params) {
        return await this.r.markSortedBatch(params);
    }
    async markProcessed(params) {
        return await this.r.markProcessed(params);
    }
    async markProcessedBatch(options) {
        const params = new MarkProcessedBatchParams(options.ids, options.signatures);
        return await this.r.markProcessedBatch(params);
    }
    // ────────────────────────────────────────────────────────
    // BATCH PROCESSOR (Private)
    // ────────────────────────────────────────────────────────
    async processBatch(batch) {
        if (batch.length === 0)
            return;
        const result = await this.r.insertBatch(batch);
        if (!result.ok) {
            // Surface to the queue's error event — let the buffer's
            // listener decide retry vs. dead-letter. Don't throw here
            // or we'll kill the flush loop.
            this.insertBuffer['queue'].emit('error', new Error(result.reason ?? 'insertBatch_failed'), batch);
        }
    }
}
// ============================================================
// FACTORY
// ============================================================
export function createLogDataService(config) {
    return new LogDataService(config);
}
