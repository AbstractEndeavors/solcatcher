/**
 * EVENT DISPATCH
 *
 * Unified processor entry point for all decoded events.
 *
 * Pattern:
 *   - Registry over switch: processors are registered, not branched
 *   - One classification point, one dispatch point
 *   - RepoResult<T> at the public boundary
 *   - Batch via Promise.allSettled — partial success, never silent drops
 *
 * Extension: register a new processor, add the kind to EventKind. Done.
 */
import { getDeps } from '@repoServices';
import { EventKind } from '@imports';
import { processTradeEvent, processCreateEvent, } from './upsert.js';
// ============================================================
// DISCRIMINATED UNION — exhaustive, no structural guessing
// ============================================================
// ============================================================
// PROCESSOR REGISTRY
// ============================================================
/**
 * Registry maps EventKind → processor.
 * Adding a new event type = add to EventKind + register here.
 * No other code changes.
 */
const ProcessorRegistry = new Map([
    [EventKind.TRADE, processTradeEvent],
    [EventKind.CREATE, processCreateEvent],
]);
// ============================================================
// SINGLE-EVENT DISPATCH
// ============================================================
export async function dispatchEvent(event, deps = null, publish = true) {
    const processor = ProcessorRegistry.get(event.kind);
    if (!processor) {
        return {
            ok: false,
            value: null,
            reason: 'unregistered_event_kind',
            meta: { kind: event.kind },
        };
    }
    try {
        const resolved = await getDeps(deps);
        const ctx = await processor(event, resolved, publish);
        return { ok: true, value: ctx };
    }
    catch (err) {
        return {
            ok: false,
            value: null,
            reason: 'processor_failed',
            meta: {
                kind: event.kind,
                err: String(err),
                signature: event.provenance?.signature,
            },
        };
    }
}
// ============================================================
// BATCH DISPATCH
// ============================================================
export async function dispatchEventBatch(events, deps = null, publish = true) {
    // Resolve deps once — shared across the batch
    const resolved = await getDeps(deps);
    const settled = await Promise.allSettled(events.map(event => dispatchEvent(event, resolved, publish)));
    const succeeded = [];
    const failed = [];
    for (let i = 0; i < settled.length; i++) {
        const result = settled[i];
        if (result.status === 'fulfilled' && result.value.ok && result.value.value != null) {
            succeeded.push(result.value.value);
        }
        else {
            const reason = result.status === 'rejected'
                ? { ok: false, value: null, reason: 'unhandled_rejection', meta: { err: String(result.reason) } }
                : result.value;
            failed.push({ ...reason, index: i });
        }
    }
    return { succeeded, failed };
}
// ============================================================
// REGISTRY EXTENSION API
// ============================================================
/**
 * Register a processor for a new event kind at wiring time.
 * Call this in your bootstrap/factory — not lazily.
 *
 * Example:
 *   registerProcessor(EventKind.EXTEND, processExtendEvent);
 */
export function registerProcessor(kind, processor) {
    if (ProcessorRegistry.has(kind)) {
        throw new Error(`registerProcessor: processor for kind "${kind}" already registered. ` +
            `Overwriting processors is not allowed — use a new EventKind.`);
    }
    ProcessorRegistry.set(kind, processor);
}
/**
 * Read-only snapshot of registered kinds — for diagnostics/startup checks.
 */
export function getRegisteredKinds() {
    return [...ProcessorRegistry.keys()];
}
