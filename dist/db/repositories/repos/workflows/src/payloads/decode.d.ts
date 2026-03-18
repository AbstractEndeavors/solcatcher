/**
 * decodePayloads — UPDATED
 *
 * This is now a thin router. It receives IngestResult (or LogPayloadContext),
 * checks for pre-decoded events, and routes them to pair/meta/txn services.
 *
 * If called with a plain LogPayloadContext (no decoded events),
 * it falls back to service.decodePartitioned().
 *
 * In the common case (called right after ingest), this does zero decoding.
 */
import { LogOrchestrator } from './../LogOrchestrator.js';
import type { LogPayloadContext } from '@imports';
import { type IngestResult } from '@imports';
export declare function decodePayloads(this: LogOrchestrator, event: LogPayloadContext | IngestResult): Promise<void>;
