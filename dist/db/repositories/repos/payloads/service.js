/**
 * LOG PAYLOADS SERVICE (updated)
 *
 * CHANGE: decode is now a first-class pipeline in the service.
 *
 * Before: enricher.ts and decode.ts both inlined:
 *   initializeRegistry() → decode() → extractTradeGuard() → process...
 *
 * After: service.decode(signature) → DecodeBatchResult with typed events.
 *   The orchestrator/enricher receives ClassifiedEvent[] and routes them.
 *
 * The decode pipeline lives in ./decode/ and is bound to the repo.
 * This service just exposes it with the same explicit-wiring pattern
 * as every other method.
 */
import { SOLANA_PUMP_FUN_PROGRAM_ID, isSignature, isId, initializeRegistry, transformSolanaTransaction } from './imports.js';
import { LogPayloadRepository } from './repository/index.js';
// ── NEW: decode pipeline ──
import { processParsedLogs, parseProgramLogs, } from '@imports';
export function getLogLines(logs_b64) {
    let logLines;
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
    return logLines;
}
// ============================================================
// SERVICE
// ============================================================
export class LogPayloadService {
    repo;
    constructor(config) {
        this.repo = new LogPayloadRepository(config.db);
    }
    // ──────────────────────────────────────────────────────
    // LIFECYCLE
    // ──────────────────────────────────────────────────────
    async start() {
        await this.repo.createTable();
    }
    // ──────────────────────────────────────────────────────
    // DECODE PIPELINE (NEW — replaces inline decode in enricher/orchestrator)
    // ──────────────────────────────────────────────────────
    /**
     * Decode all payloads for a signature → typed ClassifiedEvent[].
     *
     * This is the canonical entrypoint. The enricher, the orchestrator,
     * the queue consumer — they all call this instead of inlining
     * registry.decode() + extractTradeGuard() themselves.
     */
    async decode(signature) {
        return await this.repo.decodeBySignature.call(this.repo, signature);
    }
    /**
     * Decode a single payload by id.
     */
    async decodeOne(id) {
        return await this.repo.decodeById.call(this.repo, id);
    }
    /**
     * Decode + partition into { trades, creates, unknowns }.
     *
     * Convenience for callers that immediately branch on kind.
     */
    async decodePartitioned(signature) {
        return await this.repo.decodeAndPartition.call(this.repo, signature);
    }
    /**
     * Decode pre-fetched rows (no DB round-trip).
     */
    decodeExisting(signature, rows) {
        return this.repo.decodeRows(signature, rows);
    }
    async extractPayloadsFromSummary(batches) {
        return batches.flatMap(b => b.ids.map(id => ({
            id,
            signature: b.signature,
            program_id: b.program_id,
        })));
    }
    async extractPayloadsFromSummaryHydrate(batches) {
        const ids = batches.flatMap(b => b.ids);
        if (!ids.length)
            return [];
        return await this.repo.fetchByIds(ids);
    }
    assertSummaryIntegrity(batches) {
        for (const b of batches) {
            if (b.ids.length !== b.count) {
                throw new Error(`Summary mismatch for ${b.signature}:${b.program_id}`);
            }
        }
    }
    // ──────────────────────────────────────────────────────
    // INSERT (unchanged)
    // ──────────────────────────────────────────────────────
    async insertBatch(rows) {
        return await this.repo.insertBatch(rows);
    }
    async insertUnknownInstruction(params) {
        return await this.repo.insertUnknownInstruction(params);
    }
    async extractAndInsertFromRawLogData(logData) {
        if (!logData)
            return [];
        const logLines = getLogLines(logData.logs_b64);
        const parsedLogs = parseProgramLogs(logLines);
        const payloadItems = processParsedLogs(logData.signature, parsedLogs);
        const batches = await this.insertBatch(payloadItems);
        // BatchPayloadInsertSummary[][]
        return batches.flat();
    }
    async extractAndInsertFromLogData(logData) {
        if (!logData?.parsed_logs?.length)
            return [];
        const payloads = processParsedLogs(logData.signature, logData.parsed_logs);
        if (!payloads.length)
            return [];
        const batches = await this.insertBatch(payloads);
        // BatchPayloadInsertSummary[][]
        return batches.flat();
    }
    async extractAndInsertFromLogDataExplicit(logData) {
        if (!logData?.parsed_logs?.length) {
            return { kind: 'empty' };
        }
        const payloads = processParsedLogs(logData.signature, logData.parsed_logs);
        if (!payloads.length) {
            return { kind: 'empty' };
        }
        const summaries = (await this.insertBatch(payloads)).flat();
        return { kind: 'inserted', summaries };
    }
    async extractAndInsertTxnData(txnData, program_id = null) {
        const { signature, tx } = txnData;
        const { meta } = tx;
        if (!tx || !meta) {
            return [];
        }
        program_id = program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
        const logMessages = meta.logMessages;
        const parsed_logs = parseProgramLogs(logMessages);
        return await this.extractAndInsertFromLogData({ signature, parsed_logs });
    }
    // ──────────────────────────────────────────────────────
    // QUERY (unchanged)
    // ──────────────────────────────────────────────────────
    async isDecodable(params) {
        let rows = [];
        let row = null;
        if (isSignature(params.signature)) {
            rows = await this.repo.fetchBySignature(params.signature);
        }
        if (isId(params.id)) {
            row = await this.repo.fetchById(params.id);
        }
        if (row) {
            rows = [row];
        }
        for (row of rows) {
            if (row.decodable == null) {
                const registry = initializeRegistry();
                const b64Str = Buffer.from(row.b64, 'base64');
                const isKnown = registry.unified.has(b64Str);
                if (!isKnown) {
                    await this.setUndecodable(row.id);
                }
                else {
                    await this.setDecodable(row.id);
                }
            }
        }
        return await this.repo.countUnprocessed();
    }
    async fetchById(id) {
        return await this.repo.fetchById(id);
    }
    async fetchBySignature(signature) {
        return await this.repo.fetchBySignature(signature);
    }
    async fetchByDiscriminator(params) {
        return await this.repo.fetchByDiscriminator(params);
    }
    async fetchByLimit(params) {
        return await this.repo.fetchByLimit(params);
    }
    // ──────────────────────────────────────────────────────
    // PROCESSING WORKFLOW (unchanged)
    // ──────────────────────────────────────────────────────
    async markProcessed(id) {
        await this.repo.markProcessed(id);
    }
    async markFailed(id) {
        await this.repo.markFailed(id);
    }
    async setDecodedData(id, data) {
        return await this.repo.setDecodedData(id, data);
    }
    async processPayload(id, handler) {
        const row = await this.fetchById(id);
        if (!row)
            return null;
        try {
            const result = await handler(row);
            await this.markProcessed(id);
            return result;
        }
        catch (error) {
            await this.markFailed(id);
            throw error;
        }
    }
    async processUnprocessedBatch(handler, input) {
        const rows = await this.repo.fetchByUnprocessed(input);
        let processed = 0;
        let failed = 0;
        for (const row of rows) {
            if (row.id === null)
                continue;
            try {
                await handler(row);
                await this.markProcessed(row.id);
                processed++;
            }
            catch {
                await this.markFailed(row.id);
                failed++;
            }
        }
        return { processed, failed };
    }
    // ──────────────────────────────────────────────────────
    // ANALYTICS (unchanged)
    // ──────────────────────────────────────────────────────
    async fetchDiscriminatorEvents() {
        return await this.repo.fetchDiscriminatorEvents();
    }
    async fetchDiscriminatorVersions() {
        return await this.repo.fetchDiscriminatorVersions();
    }
    async fetchDiscriminatorProgramFrequency() {
        return await this.repo.fetchDiscriminatorProgramFrequency();
    }
    async countByProgram() {
        return await this.repo.countByProgram();
    }
    async countUnprocessed() {
        return await this.repo.countUnprocessed();
    }
    async setUndecodable(id) {
        await this.repo.setUndecodable(id);
    }
    async setDecodable(id) {
        await this.repo.setDecodable(id);
    }
    // ──────────────────────────────────────────────────────
    // HELPERS (unchanged)
    // ──────────────────────────────────────────────────────
    async hasSignature(signature) {
        const rows = await this.fetchBySignature(signature);
        return rows.length > 0;
    }
    async getDiscriminatorsForProgram(program_id) {
        const freqMap = await this.fetchDiscriminatorProgramFrequency();
        const discriminators = [];
        for (const [disc, programMap] of freqMap) {
            if (programMap.has(program_id)) {
                discriminators.push(disc);
            }
        }
        return discriminators;
    }
}
// ============================================================
// FACTORY (Explicit wiring)
// ============================================================
export function createLogPayloadService(config) {
    return new LogPayloadService(config);
}
