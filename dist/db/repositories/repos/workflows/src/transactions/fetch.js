/**
 * FETCH + INSERT TRANSACTION — UPDATED
 *
 * Same decode-at-ingest pattern as ingest.ts.
 * fetchOrCreate returns IngestResult when it creates new data.
 * fetchAndInsertTransaction returns IngestResult with decoded events.
 */
import { LogOrchestrator } from './../LogOrchestrator.js';
'./enrich/index.js';
import { fetchTransaction } from '@rateLimiter';
import { expectSingleRow, isSignature, SOLANA_PUMP_FUN_PROGRAM_ID, transformSolanaTransaction } from '@imports';
import { emptyIngestResult, buildIngestResult, partitionEvents, } from '@imports';
import { getDeps } from '@repoServices';
export async function fetchOrLoopTransaction(deps) {
    // Try fetch first
    deps = getDeps(deps);
    const rows = await this.cfg.logData.fetch(options);
    if (!rows) {
        const signature = options.signature;
        if (isSignature(signature)) {
            const response = await fetchTransaction({ signature, encoding: 'base64' });
            const insertData = transformSolanaTransaction(signature, response);
            await publisher.publish('logIntake', insertData);
        }
    }
}
export async function fetchOrCreate(options) {
    // Try fetch first
    const existing = await this.cfg.logData.fetch(options);
    if (existing) {
        return existing;
    }
    const signature = options.signature;
    const program_id = options.program_id;
    if (!isSignature(signature)) {
        return null;
    }
    await this.fetchAndInsertTransaction(signature, program_id);
    const row = await this.cfg.logData.fetchBySignature(signature);
    if (!row) {
        throw new Error('Failed to fetch inserted row');
    }
    return row;
}
export async function fetchAndInsertTransaction(signature, program_id) {
    // Fetch transaction
    const response = await fetchTransaction({ signature, encoding: 'base64' });
    if (!response) {
        throw new Error(`Transaction not found: ${signature}`);
    }
    response.signature = response.signature || signature;
    response.program_id =
        response.program_id || program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    // Transform + insert log data
    const insertData = transformSolanaTransaction(signature, response);
    const log_id = await this.cfg.logData.insert(insertData);
    // Extract payloads
    const payload_count = await this.cfg.logPayloads.extractAndInsertTxnData(response);
    const context = {
        log_id,
        signature,
        program_id: response.program_id,
        slot: response.slot,
        payload_count,
    };
    if (!payload_count) {
        return emptyIngestResult(context);
    }
    // ── Decode + classify (same pattern as ingest) ──
    const batch = await this.cfg.logPayloads.decode(signature);
    const partitioned = partitionEvents(batch.events);
    return buildIngestResult(context, batch, partitioned);
}
