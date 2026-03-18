import type { BatchPayloadInsertSummary, RawDecodeOutput, LogPayloadRow, RepoResult, LogDataRow, CreateContextEnrich, BoolLike, DataLike, ClassifiedEvent, DecodedTradeEvents } from '@imports';
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
export declare function callTxnPayloadSummaries(options: RepoResult<LogDataRow>): Promise<BatchPayloadInsertSummary[]>;
export declare function callTxnPayloads(options: RepoResult<LogDataRow>): Promise<LogPayloadRow[]>;
export declare function callTxnEvents(options: RepoResult<LogDataRow>): Promise<RawDecodeOutput[]>;
export declare function callNormalizedEvents(options: RepoResult<LogDataRow>): Promise<{
    events: ClassifiedEvent[];
    skipped: string[];
    unknown: string[];
}>;
export declare function callClassifiedEvents(options: RepoResult<LogDataRow>): Promise<{
    events: ClassifiedEvent[];
    skipped: number;
}>;
export declare function callTxnDispatchEvents(options: RepoResult<LogDataRow>): Promise<BatchDispatchResult>;
export declare function callTxnEventContexts(options: RepoResult<LogDataRow>): Promise<CreateContextEnrich[]>;
export declare function callTxnProcessEvents(options: RepoResult<LogDataRow>, publish?: boolean, deps?: AllDeps | null): Promise<CreateContextEnrich[]>;
