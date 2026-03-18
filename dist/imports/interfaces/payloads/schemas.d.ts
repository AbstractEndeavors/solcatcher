/**
 * LOG PAYLOADS LogPayloadSchemaS
 *
 * All validation happens at construction time.
 * No ad-hoc objects - everything goes through a LogPayloadSchema.
 */
import type { IdLike, SigLike, AddressLike, IntLike, DateLike } from './../imports.js';
declare abstract class LogPayloadSchema {
    constructor();
    protected abstract validate(): void;
    toJSON(): Record<string, unknown>;
}
export declare class LogPayloadRow {
    readonly id: IdLike;
    readonly signature: SigLike;
    readonly program_id: AddressLike;
    readonly discriminator: string;
    readonly payload_len: number;
    readonly event: string | null;
    readonly depth: IntLike;
    readonly invocation_index: IntLike;
    readonly reported_invocation: IntLike;
    readonly parent_program_id: AddressLike;
    readonly parent_event: string | null;
    readonly b64: string;
    readonly decodable: boolean;
    readonly decoded_data: Record<string, unknown> | null;
    readonly processed: boolean;
    readonly failed: boolean | null;
    readonly created_at: DateLike;
    readonly processed_at: DateLike;
    constructor(id: IdLike, signature: SigLike, program_id: AddressLike, discriminator: string, payload_len: number, event: string | null, depth: IntLike, invocation_index: IntLike, reported_invocation: IntLike, parent_program_id: AddressLike, parent_event: string | null, b64: string, decodable: boolean, decoded_data?: Record<string, unknown> | null, processed?: boolean, failed?: boolean | null, created_at?: DateLike, processed_at?: DateLike);
    get isProcessed(): boolean;
    get hasFailed(): boolean;
    get hasParent(): boolean;
    get isDecoded(): boolean;
}
export declare class InsertLogPayloadParams extends LogPayloadSchema {
    readonly signature: SigLike;
    readonly program_id: AddressLike;
    readonly discriminator: string;
    readonly payload_len: number;
    readonly event: string | null;
    readonly depth: IntLike;
    readonly invocation_index: IntLike;
    readonly reported_invocation: IntLike;
    readonly parent_program_id: AddressLike;
    readonly parent_event: string | null;
    readonly b64: string;
    readonly decodable: boolean;
    constructor(signature: SigLike, program_id: AddressLike, discriminator: string, payload_len: number, event: string | null, depth: IntLike, invocation_index: IntLike, reported_invocation: IntLike, parent_program_id: AddressLike, parent_event: string | null, b64: string, decodable: boolean);
    protected validate(): void;
}
export declare class InsertUnknownInstructionParams extends LogPayloadSchema {
    readonly signature: SigLike;
    readonly program_id: AddressLike;
    readonly invocation_index: IntLike;
    readonly discriminator: string;
    readonly data_prefix: string;
    readonly reason: string;
    constructor(signature: SigLike, program_id: AddressLike, invocation_index: IntLike, discriminator: string, data_prefix: string, reason: string);
    protected validate(): void;
}
export declare class QueryLogPayloadByIdParams extends LogPayloadSchema {
    readonly id: IdLike;
    constructor(id: IdLike);
    protected validate(): void;
}
export declare class QueryLogPayloadBySignatureParams extends LogPayloadSchema {
    readonly signature: SigLike;
    constructor(signature: SigLike);
    protected validate(): void;
}
export declare class QueryLogPayloadByDiscriminatorParams extends LogPayloadSchema {
    readonly discriminator: string;
    constructor(discriminator: string);
    protected validate(): void;
}
/**
 * Lightweight interface for batch insert JSON serialization.
 * Use InsertLogPayloadParams for single validated inserts.
 */
export interface LogPayloadBatchItem {
    signature: SigLike;
    program_id: AddressLike;
    discriminator: string;
    payload_len: number;
    event: string | null | undefined;
    depth: IntLike;
    invocation_index: IntLike;
    reported_invocation: IntLike;
    parent_program_id: AddressLike;
    parent_event: string | null;
    b64: string;
    decodable: boolean;
}
/**
 * Convert validated params to batch item
 */
export declare function toBatchItem(params: InsertLogPayloadParams): LogPayloadBatchItem;
export type LogPayloadRows = LogPayloadRow[];
export type LogPayloadRowLike = LogPayloadRow | null;
export type LogPayloadRowsLike = LogPayloadRows | null;
export type LogPayloadLike = LogPayloadRow | LogPayloadRows | null;
export declare class LogPayloadInsert {
    readonly signature: string;
    readonly program_id: string;
    readonly discriminator: string;
    readonly payload_len: number;
    readonly event: string | null;
    readonly depth: number;
    readonly invocation_index: number;
    readonly reported_invocation: number | null;
    readonly parent_program_id: string | null;
    readonly parent_event: string | null;
    readonly b64: string;
    readonly decodable: boolean;
    constructor(signature: string, program_id: string, discriminator: string, payload_len: number, event: string | null, depth: number, invocation_index: number, reported_invocation: number | null, parent_program_id: string | null, parent_event: string | null, b64: string, decodable: boolean);
    toJSON(): Record<string, any>;
}
export declare class ProgramDataEntry {
    readonly raw: string;
    readonly decoded: Buffer;
    readonly payload: any;
    readonly discriminator: string;
    constructor(raw: string, // Base64 string
    decoded: Buffer, // Decoded bytes
    payload: any, // Parsed payload from registry
    discriminator: string);
}
export {};
