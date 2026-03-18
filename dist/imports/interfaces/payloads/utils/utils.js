import { initializeRegistry } from './../../../decoding/index.js';
import { LogPayloadInsert, ProgramDataEntry } from './../schemas.js';
export class DecodedLogs {
    logs;
    static _registry = initializeRegistry();
    constructor(logs) {
        this.logs = logs;
    }
    get registry() {
        return DecodedLogs._registry;
    }
    static fromBase64(logsB64) {
        const decodedJson = Buffer.from(logsB64, 'base64').toString('utf-8');
        const logs = JSON.parse(decodedJson);
        return new DecodedLogs(logs);
    }
    filterByProgram(programId) {
        return this.logs.filter(log => log.includes(programId));
    }
    getInstructions() {
        return this.logs.filter(log => log.includes('Instruction:'));
    }
    getProgramData() {
        return this.logs
            .filter(log => log.includes('Program data:'))
            .map(log => log.replace('Program data: ', ''));
    }
    getInvocations() {
        return this.logs.filter(log => log.includes('invoke'));
    }
    // Decode program data with registry
    getDecodedProgramData(REGISTRY = null) {
        const registry = REGISTRY || this.registry;
        const programData = this.getProgramData();
        const decoded = [];
        for (const b64 of programData) {
            const buffer = Buffer.from(b64, 'base64');
            try {
                const payload = registry.decode(buffer);
                // Extract discriminator (first 8 bytes as hex)
                const discriminator = buffer.slice(0, 8).toString('hex');
                decoded.push(new ProgramDataEntry(b64, buffer, payload, discriminator));
            }
            catch (err) {
                console.error('Failed to decode program data:', err);
            }
        }
        return decoded;
    }
    // ✅ NEW: Create insert payloads from decoded program data
    createInsertPayloads(params) {
        const decodedEntries = this.getDecodedProgramData(params.REGISTRY);
        const inserts = [];
        for (let i = 0; i < decodedEntries.length; i++) {
            const entry = decodedEntries[i];
            // Determine if decodable
            const decodable = entry.payload !== null && entry.payload !== undefined;
            // Extract event name if available
            const event = entry.payload?.name || entry.payload?.type || null;
            // Create insert schema
            const insert = new LogPayloadInsert(params.signature, params.programId, entry.discriminator, entry.decoded.length, event, params.depth || 0, i, // invocation_index
            null, // reported_invocation
            params.parentProgramId || null, params.parentEvent || null, entry.raw, decodable);
            inserts.push(insert);
        }
        return inserts;
    }
    // Advanced: track invocation depth and parent relationships
    createInsertPayloadsWithContext(params) {
        const invocations = this.getInvocations();
        const decodedEntries = this.getDecodedProgramData(params.REGISTRY);
        const inserts = [];
        // Track invocation depth from logs
        let depth = 0;
        let parentProgramId = null;
        for (let i = 0; i < decodedEntries.length; i++) {
            const entry = decodedEntries[i];
            // Extract depth from corresponding invocation log if available
            if (i < invocations.length) {
                const invocationMatch = invocations[i].match(/\[(\d+)\]/);
                if (invocationMatch) {
                    depth = parseInt(invocationMatch[1], 10);
                }
                // Extract parent program from invocation log
                const programMatch = invocations[i].match(/Program (\w+) invoke/);
                if (programMatch) {
                    parentProgramId = programMatch[1];
                }
            }
            const decodable = entry.payload !== null && entry.payload !== undefined;
            const event = entry.payload?.name || entry.payload?.type || null;
            const insert = new LogPayloadInsert(params.signature, params.programId, entry.discriminator, entry.decoded.length, event, depth, i, null, parentProgramId, null, entry.raw, decodable);
            inserts.push(insert);
        }
        return inserts;
    }
}
export function getDecodedLogDataLogs(logData) {
    return DecodedLogs.fromBase64(logData.logs_b64);
}
export function decodeLogDataPayloads(logData) {
    const decodedLogs = getDecodedLogDataLogs(logData);
    return decodedLogs.createInsertPayloadsWithContext({
        signature: logData.signature,
        programId: logData.program_id
    });
}
/**
 * ENRICHMENT CONTEXT EXTENSION
 *
 * Problem: EnrichmentContext is created from pair/meta data.
 *          IngestResult carries decoded events.
 *          These are two different objects in two different workflows.
 *
 * Solution: EnrichmentContext gains an optional `decoded_events` field.
 *           When the caller has IngestResult, it bridges events into the context.
 *           When enrichment runs standalone (re-enrichment, backfill),
 *           the field is absent and the enricher falls back to service.decode().
 *
 * This file provides:
 *   - The extended type
 *   - A bridge function: IngestResult → decoded_events on context
 *   - A resolve function: get events from context OR fall back to decode
 */
// ============================================================
// BRIDGE — attach IngestResult events to enrichment context
// ============================================================
/**
 * Attach decoded events from an IngestResult onto an EnrichmentContext.
 *
 * Call this when you have both — typically right after ingest, before
 * kicking off enrichment for the same pair.
 */
export function attachDecodedEvents(ctx, ingestResult) {
    return {
        ...ctx,
        decoded_events: ingestResult.decoded,
    };
}
// ============================================================
// RESOLVE — get events from context OR fall back to decode
// ============================================================
/**
 * Returns PartitionedEvents from the context if pre-decoded,
 * otherwise calls the service to decode fresh.
 *
 * This is the ONLY function enrichers should call to get decoded events.
 * It encapsulates the "decode once, fall back if needed" pattern.
 */
export async function resolveDecodedEvents(ctx, service, signature) {
    // Fast path: events were pre-decoded at ingest
    if (ctx.decoded_events) {
        const { trades, creates, unknowns } = ctx.decoded_events;
        if (trades.length > 0 || creates.length > 0 || unknowns.length > 0) {
            return ctx.decoded_events;
        }
    }
    // Slow path: decode from DB (re-enrichment, backfill, old data)
    const { trades, creates, unknowns } = await service.decodePartitioned(signature);
    return { trades, creates, unknowns };
}
