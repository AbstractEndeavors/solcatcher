import { LogPayloadInsert, ProgramDataEntry } from './../schemas.js';
import type { PartitionedEvents, EnrichmentContextWithEvents, EnrichmentContext, SigLike, IngestResult } from '@imports';
export declare class DecodedLogs {
    readonly logs: string[];
    private static _registry;
    constructor(logs: string[]);
    protected get registry(): any;
    static fromBase64(logsB64: string): DecodedLogs;
    filterByProgram(programId: string): string[];
    getInstructions(): string[];
    getProgramData(): string[];
    getInvocations(): string[];
    getDecodedProgramData(REGISTRY?: any): ProgramDataEntry[];
    createInsertPayloads(params: {
        signature: string;
        programId: string;
        REGISTRY?: any;
        depth?: number;
        parentProgramId?: string | null;
        parentEvent?: string | null;
    }): LogPayloadInsert[];
    createInsertPayloadsWithContext(params: {
        signature: string;
        programId: string;
        REGISTRY?: any;
    }): LogPayloadInsert[];
}
export declare function getDecodedLogDataLogs(logData: any): DecodedLogs;
export declare function decodeLogDataPayloads(logData: any): LogPayloadInsert[];
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
/**
 * Attach decoded events from an IngestResult onto an EnrichmentContext.
 *
 * Call this when you have both — typically right after ingest, before
 * kicking off enrichment for the same pair.
 */
export declare function attachDecodedEvents(ctx: EnrichmentContext, ingestResult: IngestResult): EnrichmentContextWithEvents;
/**
 * Returns PartitionedEvents from the context if pre-decoded,
 * otherwise calls the service to decode fresh.
 *
 * This is the ONLY function enrichers should call to get decoded events.
 * It encapsulates the "decode once, fall back if needed" pattern.
 */
export declare function resolveDecodedEvents(ctx: EnrichmentContextWithEvents, service: {
    decodePartitioned: (sig: SigLike) => Promise<PartitionedEvents & {
        skipped: number;
    }>;
}, signature: SigLike): Promise<PartitionedEvents>;
