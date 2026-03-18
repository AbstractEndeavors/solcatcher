/**
 * DECODE PIPELINE
 *
 * Service-level decode: fetch payloads → decode → classify → return typed batch.
 *
 * This module owns the full decode lifecycle but does NOT persist anything.
 * Persistence is the caller's job (orchestrator, enricher, queue consumer).
 *
 * The pipeline is a method mixin for LogPayloadService — it uses `this`
 * binding like the rest of the repo layer.
 *
 * Pattern: Explicit environment wiring (registry injected, not global)
 */
import { type ClassifiedEvent, type DecodeBatchResult, type PartitionedEvents } from '@imports';
import type { SigLike, IdLike, LogPayloadRow } from './imports.js';
import type { LogPayloadRepository } from './../LogPayloadRepository.js';
/**
 * Decode all payloads for a signature.
 *
 * Returns a DecodeBatchResult with typed, classified events.
 * The caller decides what to do with trades vs creates vs unknowns.
 */
export declare function decodeBySignature(this: LogPayloadRepository, signature: SigLike): Promise<DecodeBatchResult>;
/**
 * Decode a single payload by id.
 *
 * Returns the classified event or null if not decodable.
 */
export declare function decodeById(this: LogPayloadRepository, id: IdLike): Promise<ClassifiedEvent | null>;
/**
 * Decode a pre-fetched set of rows.
 *
 * Pure orchestration: no DB calls, just classify.
 * Useful when the caller already has rows from a join or batch fetch.
 */
export declare function decodeRows(signature: SigLike, rows: LogPayloadRow[]): DecodeBatchResult;
/**
 * Decode + partition in one call.
 *
 * Convenience for callers that immediately branch on event kind.
 */
export declare function decodeAndPartition(this: LogPayloadRepository, signature: SigLike): Promise<PartitionedEvents & {
    skipped: number;
}>;
