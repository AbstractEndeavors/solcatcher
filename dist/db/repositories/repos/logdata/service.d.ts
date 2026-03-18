/**
 * LOG DATA SERVICE
 *
 * Service layer for log data operations.
 * Explicit wiring, no hidden state, queue-based batching.
 *
 * Pattern: Explicit dependencies over smart defaults
 * Return: RepoResult<T> throughout — no raw nulls, no throws at boundary
 */
import type { DatabaseClient, LogPayloadOptions, RepoResult } from '@imports';
import { LogDataRepository } from './repository/index.js';
import { LogDataRow, InsertLogDataParams, UpdateLogEnrichmentParams } from '@imports';
import type { DataLike, IdLike, SigLike, LimitLike, IntLike, BoolLike } from '@imports';
export interface LogDataServiceConfig {
    db: DatabaseClient;
    batchSize?: IntLike;
    maxDelayMs?: IntLike;
    hardCap?: IntLike;
}
export declare function decodeLogsB64(logs_b64: string): string[];
export declare class LogDataService {
    /** Direct repo access for callers that don't need service-level logic */
    readonly r: LogDataRepository;
    private readonly insertBuffer;
    constructor(config: LogDataServiceConfig);
    start(): Promise<RepoResult<null>>;
    stop(): Promise<void>;
    /** Queued for batching — returns immediately */
    enqueueInsert(params: InsertLogDataParams): void;
    /** Immediate insert, bypasses queue */
    insert(params: DataLike): Promise<RepoResult<LogDataRow>>;
    insertIntent(signature: SigLike): Promise<IdLike>;
    insertBatch(rows: InsertLogDataParams[]): Promise<RepoResult<Map<SigLike, IdLike>>>;
    flush(): Promise<void>;
    fetch(params: LogPayloadOptions): Promise<RepoResult<LogDataRow>>;
    fetchById(id: IdLike): Promise<RepoResult<LogDataRow>>;
    fetchBySignature(signature: SigLike): Promise<RepoResult<LogDataRow>>;
    fetchByLimit(params: {
        limit?: LimitLike;
        latest?: BoolLike;
    }): Promise<RepoResult<LogDataRow[]>>;
    update(params: UpdateLogEnrichmentParams): Promise<RepoResult<LogDataRow>>;
    upsertParsedLogs(params: {
        id?: IdLike;
        signature?: SigLike;
        parsed_logs: DataLike;
    }): Promise<RepoResult<IdLike>>;
    private ensureCanonicalRow;
    private parseIfNeeded;
    parseAndUpsert(options: {
        id?: IdLike;
        signature?: SigLike;
        logData?: DataLike;
        returnRow?: BoolLike;
    }): Promise<RepoResult<LogDataRow>>;
    fetchOrCreate(params: {
        id?: IdLike;
        signature?: SigLike;
        limit?: LimitLike;
        latest?: BoolLike;
    }): Promise<RepoResult<LogDataRow>>;
    fetchOrCreateParsed(params: {
        id?: IdLike;
        signature?: SigLike;
        limit?: LimitLike;
        latest?: BoolLike;
    }): Promise<RepoResult<LogDataRow>>;
    markSorted(params: {
        id?: IdLike;
        signature?: SigLike;
        meta_id?: IdLike | null;
        pair_id?: IdLike | null;
        txn_id?: IdLike | null;
    }): Promise<RepoResult<IdLike>>;
    markSortedBatch(params: {
        ids?: IdLike[];
        signatures?: SigLike[];
        meta_id?: IdLike | null;
        pair_id?: IdLike | null;
        txn_id?: IdLike | null;
    }): Promise<RepoResult<IdLike[]>>;
    markProcessed(params: {
        id?: IdLike;
        signature?: SigLike;
    }): Promise<RepoResult<IdLike>>;
    markProcessedBatch(options: {
        ids?: IdLike[];
        signatures?: SigLike[];
    }): Promise<RepoResult<IdLike[]>>;
    private processBatch;
}
export declare function createLogDataService(config: LogDataServiceConfig): LogDataService;
