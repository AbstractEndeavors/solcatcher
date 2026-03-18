import type { BatchPayloadInsertSummary, RawDecodeOutput, LogPayloadRow, RepoResult, LogDataRow, CreateContextEnrich, BoolLike, DataLike, ClassifiedEvent, EnrichParams, DecodedTradeEvents } from '@imports';
import { type AllDeps } from '@repoServices';
import { type BatchDispatchResult } from './../events/index.js';
export interface Decoded {
    name: string;
    category: string;
    data: Record<string, unknown>;
}
export declare function expectRepoValue<T>(result: RepoResult<T>, context?: string): T;
export interface EventDelegate {
    success: BoolLike;
    data: DecodedTradeEvents | null | DataLike;
}
export declare function fetchAndInsertTxn(options: EnrichParams): Promise<RepoResult<LogDataRow>>;
export declare function fetchTxnRepoData(options: EnrichParams): Promise<RepoResult<LogDataRow>>;
export declare function fetchOrCreateTxnRepoResult(options: EnrichParams): Promise<RepoResult<LogDataRow>>;
export declare function fetchOrCreateTxnRepoValue(options: EnrichParams): Promise<LogDataRow>;
export declare function fetchOrCreateTxnPayloadSummaries(options: EnrichParams): Promise<BatchPayloadInsertSummary[]>;
export declare function fetchOrCreateTxnPayloads(options: EnrichParams): Promise<LogPayloadRow[]>;
export declare function fetchOrCreateTxnEvents(options: EnrichParams): Promise<RawDecodeOutput[]>;
export declare function fetchOrCreateNormalizedEvents(options: EnrichParams): Promise<{
    events: ClassifiedEvent[];
    skipped: string[];
    unknown: string[];
}>;
export declare function fetchOrCreateClassifiedEvents(options: EnrichParams): Promise<{
    events: ClassifiedEvent[];
    skipped: number;
}>;
export declare function fetchOrCreateTxnDispatchEvents(options: EnrichParams): Promise<BatchDispatchResult>;
export declare function fetchOrCreateTxnEventContexts(options: EnrichParams): Promise<CreateContextEnrich[]>;
export declare function fetchOrCreateTxnProcessEvents(options: EnrichParams, publish?: boolean, deps?: AllDeps | null): Promise<CreateContextEnrich[]>;
