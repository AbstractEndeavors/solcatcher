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
import type { DatabaseClient, LimitLike, SigLike, IdLike, StringLike, BoolLike, AddressLike, IntLike, DataLike, BatchPayloadInsertSummary, LogPayloadRowLike, LogPayloadBatchItem, LogPayloadRow, InsertLogPayloadParams, InsertUnknownInstructionParams, FetchedTransaction, InvocationRecord, LogDataRow } from './imports.js';
export type ExtractInsertResult = {
    kind: 'empty';
} | {
    kind: 'inserted';
    summaries: BatchPayloadInsertSummary[];
};
export interface LogBatchParams {
    signature: SigLike;
    parsed_logs: InvocationRecord[];
}
export type PayloadRef = {
    id: number;
    signature: string;
    program_id: AddressLike;
};
import { type DecodeBatchResult, type ClassifiedEvent, type PartitionedEvents } from '@imports';
export declare function getLogLines(logs_b64: any): string[];
export interface LogPayloadServiceConfig {
    db: DatabaseClient;
}
export declare class LogPayloadService {
    private readonly repo;
    constructor(config: LogPayloadServiceConfig);
    start(): Promise<void>;
    /**
     * Decode all payloads for a signature → typed ClassifiedEvent[].
     *
     * This is the canonical entrypoint. The enricher, the orchestrator,
     * the queue consumer — they all call this instead of inlining
     * registry.decode() + extractTradeGuard() themselves.
     */
    decode(signature: SigLike): Promise<DecodeBatchResult>;
    /**
     * Decode a single payload by id.
     */
    decodeOne(id: IdLike): Promise<ClassifiedEvent | null>;
    /**
     * Decode + partition into { trades, creates, unknowns }.
     *
     * Convenience for callers that immediately branch on kind.
     */
    decodePartitioned(signature: SigLike): Promise<PartitionedEvents & {
        skipped: number;
    }>;
    /**
     * Decode pre-fetched rows (no DB round-trip).
     */
    decodeExisting(signature: SigLike, rows: LogPayloadRow[]): DecodeBatchResult;
    extractPayloadsFromSummary(batches: BatchPayloadInsertSummary[]): Promise<PayloadRef[]>;
    extractPayloadsFromSummaryHydrate(batches: BatchPayloadInsertSummary[]): Promise<LogPayloadRow[]>;
    assertSummaryIntegrity(batches: BatchPayloadInsertSummary[]): void;
    insertBatch(rows: (InsertLogPayloadParams | LogPayloadBatchItem)[]): Promise<BatchPayloadInsertSummary[]>;
    insertUnknownInstruction(params: InsertUnknownInstructionParams): Promise<void>;
    extractAndInsertFromRawLogData(logData?: LogDataRow): Promise<BatchPayloadInsertSummary[]>;
    extractAndInsertFromLogData(logData?: DataLike): Promise<BatchPayloadInsertSummary[]>;
    extractAndInsertFromLogDataExplicit(logData?: LogBatchParams): Promise<ExtractInsertResult>;
    extractAndInsertTxnData(txnData: FetchedTransaction, program_id?: AddressLike): Promise<BatchPayloadInsertSummary[]>;
    isDecodable(params: {
        id: IdLike;
        signature: SigLike;
    }): Promise<IntLike>;
    fetchById(id: IdLike): Promise<LogPayloadRowLike>;
    fetchBySignature(signature: SigLike): Promise<LogPayloadRow[]>;
    fetchByDiscriminator(params: {
        discriminator?: StringLike;
        limit?: LimitLike;
        latest?: BoolLike;
    }): Promise<LogPayloadRow[]>;
    fetchByLimit(params: {
        limit?: LimitLike;
        latest?: BoolLike;
    }): Promise<LogPayloadRow[]>;
    markProcessed(id: IdLike): Promise<void>;
    markFailed(id: IdLike): Promise<void>;
    setDecodedData(id: IdLike, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    processPayload<T>(id: IdLike, handler: (row: LogPayloadRow) => Promise<T>): Promise<T | null>;
    processUnprocessedBatch(handler: (row: LogPayloadRow) => Promise<{
        processed: IntLike;
        failed: number;
    }>, input: {
        limit?: LimitLike;
        latest?: BoolLike;
    }): Promise<{
        processed: IntLike;
        failed: number;
    }>;
    fetchDiscriminatorEvents(): Promise<Map<string, string[]>>;
    fetchDiscriminatorVersions(): Promise<Map<SigLike, IdLike>>;
    fetchDiscriminatorProgramFrequency(): Promise<Map<string, Map<AddressLike, IntLike>>>;
    countByProgram(): Promise<Map<AddressLike, IdLike>>;
    countUnprocessed(): Promise<IntLike>;
    setUndecodable(id: IdLike): Promise<void>;
    setDecodable(id: IdLike): Promise<void>;
    hasSignature(signature: SigLike): Promise<BoolLike>;
    getDiscriminatorsForProgram(program_id: string): Promise<string[]>;
}
export declare function createLogPayloadService(config: LogPayloadServiceConfig): LogPayloadService;
