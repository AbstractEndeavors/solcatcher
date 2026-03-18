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
import { classifyPayloadBatch, classifyPayload, EventKind, partitionEvents, } from '@imports';
import { initializeRegistry } from './imports.js';
// ============================================================
// REGISTRY HOLDER — initialized once, not per-call
// ============================================================
let _registry = null;
function getRegistry() {
    if (!_registry) {
        _registry = initializeRegistry();
    }
    return _registry;
}
// ============================================================
// PIPELINE FUNCTIONS (bound to LogPayloadRepository via `this`)
// ============================================================
/**
 * Decode all payloads for a signature.
 *
 * Returns a DecodeBatchResult with typed, classified events.
 * The caller decides what to do with trades vs creates vs unknowns.
 */
export async function decodeBySignature(signature) {
    const rows = await this.fetchBySignature(signature);
    return decodeRows(signature, rows);
}
/**
 * Decode a single payload by id.
 *
 * Returns the classified event or null if not decodable.
 */
export async function decodeById(id) {
    const row = await this.fetchById(id);
    if (!row)
        return null;
    return classifyPayload(row, getRegistry());
}
/**
 * Decode a pre-fetched set of rows.
 *
 * Pure orchestration: no DB calls, just classify.
 * Useful when the caller already has rows from a join or batch fetch.
 */
export function decodeRows(signature, rows) {
    const registry = getRegistry();
    const { events, skipped } = classifyPayloadBatch(rows, registry);
    let trade_count = 0;
    let create_count = 0;
    let unknown_count = 0;
    for (const e of events) {
        switch (e.kind) {
            case EventKind.TRADE:
                trade_count++;
                break;
            case EventKind.CREATE:
                create_count++;
                break;
            case EventKind.UNKNOWN:
                unknown_count++;
                break;
        }
    }
    return {
        signature,
        events,
        trade_count,
        create_count,
        unknown_count,
        skipped_count: skipped,
    };
}
/**
 * Decode + partition in one call.
 *
 * Convenience for callers that immediately branch on event kind.
 */
export async function decodeAndPartition(signature) {
    const batch = await decodeBySignature.call(this, signature);
    const partitioned = partitionEvents(batch.events);
    return { ...partitioned, skipped: batch.skipped_count };
}
