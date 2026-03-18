/**
 * SCHEMAS (Explicit data contracts)
 *
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a schema.
 */
/**
 * SCHEMAS (Explicit data contracts)
 * Two-phase lifecycle:
 *   1. Intent (identity-only)
 *   2. Enriched (chain-complete)
 */
import type { IdLike, SigLike, LimitLike, DataLike, IntLike, AddressLike } from './imports.js';
export declare abstract class LogDataSchema {
    constructor();
    protected abstract validate(): void;
    toJSON(): Record<string, unknown>;
}
export declare class LogDataRow {
    readonly id: number;
    readonly signature: string;
    readonly slot: number | null;
    readonly program_id: string | null;
    readonly logs_b64: DataLike;
    readonly parsed_logs: unknown | null;
    readonly pair_id: number | null;
    readonly txn_id: number | null;
    readonly sorted: boolean;
    readonly signatures: string[] | null;
    readonly intake_at: Date;
    readonly created_at: Date;
    readonly updated_at: Date;
    constructor(id: number, signature: string, slot: number | null, program_id: string | null, logs_b64: DataLike, parsed_logs?: unknown | null, pair_id?: number | null, txn_id?: number | null, sorted?: boolean, signatures?: string[] | null, intake_at?: Date, created_at?: Date, updated_at?: Date);
    get isParsed(): boolean;
    get isEnriched(): boolean;
    get isSorted(): boolean;
    get decodedLogs(): DataLike[];
}
/**
 * Phase 1: intent-only insert
 * Used when chain data is unavailable
 */
export declare class InsertLogDataIntentParams extends LogDataSchema {
    readonly signature: string;
    constructor(signature: string);
    protected validate(): void;
}
/**
 * Phase 2: Enrichment update
 * Attaches discovered facts to an existing log row
 */
export declare class UpdateLogDataEnrichmentParams extends LogDataSchema {
    readonly signature: string;
    readonly slot?: number | null | undefined;
    readonly program_id?: string | null | undefined;
    readonly pair_id?: number | null | undefined;
    readonly txn_id?: number | null | undefined;
    readonly signatures?: string[] | null | undefined;
    readonly sorted?: boolean | undefined;
    constructor(signature: string, slot?: number | null | undefined, program_id?: string | null | undefined, pair_id?: number | null | undefined, txn_id?: number | null | undefined, signatures?: string[] | null | undefined, sorted?: boolean | undefined);
    protected validate(): void;
    get normalizedSignatures(): string[] | null;
}
/**
 * Phase 2: chain-complete insert
 */
export declare class InsertLogDataParams extends LogDataSchema {
    readonly signature: string;
    readonly slot: number;
    readonly program_id: string;
    readonly logs_b64: string;
    readonly signatures: string[];
    constructor(signature: string, slot: number, program_id: string, logs_b64: string, signatures?: string[]);
    protected validate(): void;
    get normalizedSignatures(): string[];
}
export declare class UpsertParsedLogsParams extends LogDataSchema {
    readonly id: IdLike;
    readonly parsed_logs: DataLike;
    constructor(id: IdLike, parsed_logs: DataLike);
    protected validate(): void;
}
export declare class QueryLogDataByIdParams extends LogDataSchema {
    readonly id: IdLike;
    constructor(id: IdLike);
    protected validate(): void;
}
export declare class QueryLogDataBySignatureParams extends LogDataSchema {
    readonly signature: SigLike;
    constructor(signature: SigLike);
    protected validate(): void;
}
export declare class QueryUnsortedParams extends LogDataSchema {
    readonly limit: LimitLike;
    constructor(limit?: LimitLike);
    protected validate(): void;
}
export declare class MarkLogDataProcessedParams extends LogDataSchema {
    readonly id?: IdLike;
    readonly signature?: SigLike;
    constructor(id?: IdLike, signature?: SigLike);
    protected validate(): void;
    get isById(): boolean;
    get isBySignature(): boolean;
}
export declare class MarkLogDataProcessedBatchParams extends LogDataSchema {
    readonly ids?: IdLike[] | undefined;
    readonly signatures?: SigLike[] | undefined;
    constructor(ids?: IdLike[] | undefined, signatures?: SigLike[] | undefined);
    protected validate(): void;
    get isById(): boolean;
    get isBySignature(): boolean;
}
export declare class InvocationRecord {
    readonly program_id: AddressLike;
    readonly invocation_index: IntLike;
    readonly depth: IntLike;
    readonly logs: DataLike[];
    readonly data: DataLike[];
    readonly children: IntLike[];
    readonly reported_invocation?: IntLike;
    readonly compute?: {
        consumed: IntLike;
        limit: LimitLike;
    } | undefined;
    constructor(program_id: AddressLike, invocation_index: IntLike, depth: IntLike, logs?: DataLike[], data?: DataLike[], children?: IntLike[], reported_invocation?: IntLike, compute?: {
        consumed: IntLike;
        limit: LimitLike;
    } | undefined);
}
/**
 * Phase 1: intent-only insert
 * Used when chain data is unavailable
 */
export declare class InsertLogIntentParams extends LogDataSchema {
    readonly signature: string;
    constructor(signature: string);
    protected validate(): void;
}
/**
 * Phase 2: Enrichment update
 * Attaches discovered facts to an existing log row
 */
export declare class UpdateLogEnrichmentParams extends LogDataSchema {
    readonly signature: string;
    readonly slot?: number | null | undefined;
    readonly program_id?: string | null | undefined;
    readonly pair_id?: number | null | undefined;
    readonly txn_id?: number | null | undefined;
    readonly signatures?: string[] | null | undefined;
    readonly sorted?: boolean | undefined;
    constructor(signature: string, slot?: number | null | undefined, program_id?: string | null | undefined, pair_id?: number | null | undefined, txn_id?: number | null | undefined, signatures?: string[] | null | undefined, sorted?: boolean | undefined);
    protected validate(): void;
    get normalizedSignatures(): string[] | null;
}
export declare class QueryByIdParams extends LogDataSchema {
    readonly id: IdLike;
    constructor(id: IdLike);
    protected validate(): void;
}
export declare class QueryBySignatureParams extends LogDataSchema {
    readonly signature: SigLike;
    constructor(signature: SigLike);
    protected validate(): void;
}
export declare class MarkProcessedParams extends LogDataSchema {
    readonly id?: IdLike;
    readonly signature?: SigLike;
    constructor(id?: IdLike, signature?: SigLike);
    protected validate(): void;
    get isById(): boolean;
    get isBySignature(): boolean;
}
export declare class MarkProcessedBatchParams extends LogDataSchema {
    readonly ids?: IdLike[] | undefined;
    readonly signatures?: SigLike[] | undefined;
    constructor(ids?: IdLike[] | undefined, signatures?: SigLike[] | undefined);
    protected validate(): void;
    get isById(): boolean;
    get isBySignature(): boolean;
}
export interface MutableInvocation {
    program_id: string;
    invocation_index: number;
    depth: number;
    reported_invocation?: number;
    logs: string[];
    data: string[];
    children: MutableInvocation[];
    compute?: {
        consumed: number;
        limit: number;
    };
}
export interface RepoResult<T> {
    ok: boolean;
    value: T | null;
    reason?: string;
    meta?: Record<string, unknown>;
}
