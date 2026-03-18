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

import type {
  DecodedTradeEvents,
  EventKindValue,
  CreateContextEnrich,
  ClassifiedEvent,
  RepoResult
} from '@imports';
import type { AllDeps } from '@db';
import { EventKind } from '@imports';
import {
  processTradeEvent,
  processCreateEvent,
} from './process.js';

// ============================================================
// PROCESSOR REGISTRY
// ============================================================
/**
 * Registry maps EventKind → processor.
 * Adding a new event type = add to EventKind + register here.
 * No other code changes.
 */
const ProcessorRegistry = new Map<EventKindValue, EventProcessor>([
  [EventKind.TRADE,   processTradeEvent  as EventProcessor],
  [EventKind.CREATE,  processCreateEvent as EventProcessor],
]);

// ============================================================
// SINGLE-EVENT DISPATCH
// ============================================================

export async function dispatchEvent(
  event: ClassifiedEvent,
  deps: AllDeps,
  publish = true,
): Promise<RepoResult<CreateContextEnrich>> {
  const processor = ProcessorRegistry.get(event.kind as EventKindValue);

  if (!processor) {
    return {
      ok: false,
      reason: 'unregistered_event_kind',
      meta: { kind: event.kind },
    };
  }

  try {
    const ctx = await processor(event,deps,publish);
    return { ok: true, value: ctx };
  } catch (err) {
    return {
      ok: false,
      reason: 'processor_failed',
      meta: {
        kind: event.kind,
        err: String(err),
        signature: (event as DecodedTradeEvents).provenance?.signature,
      },
    };
  }
}

// ============================================================
// BATCH DISPATCH
// ============================================================



export async function dispatchEventBatch(
  events: ClassifiedEvent[],
  deps: AllDeps,
  publish = true,
): Promise<BatchDispatchResult> {
  // Resolve deps once — shared across the batch

  const settled = await Promise.allSettled(
    events.map(event => dispatchEvent(event, deps, publish))
  );

  const succeeded: CreateContextEnrich[] = [];
  const failed: BatchDispatchResult['failed'] = [];

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];

    if (result.status === 'fulfilled' && result.value.ok && result.value.value != null) {
      succeeded.push(result.value.value);
    } else {
      const reason =
        result.status === 'rejected'
          ? { ok: false as const, value: null, reason: 'unhandled_rejection', meta: { err: String(result.reason) } }
          : result.value;

      failed.push({ ...reason, index: i } as BatchDispatchResult['failed'][number]);
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
export function registerProcessor<E extends ClassifiedEvent>(
  kind: EventKindValue,
  processor: EventProcessor<E>,
): void {
  if (ProcessorRegistry.has(kind)) {
    throw new Error(
      `registerProcessor: processor for kind "${kind}" already registered. ` +
      `Overwriting processors is not allowed — use a new EventKind.`
    );
  }
  ProcessorRegistry.set(kind, processor as EventProcessor);
}

/**
 * Read-only snapshot of registered kinds — for diagnostics/startup checks.
 */
export function getRegisteredKinds(): EventKindValue[] {
  return [...ProcessorRegistry.keys()];
}
export type EventProcessor<E extends ClassifiedEvent = ClassifiedEvent> = (
  event: E,
  deps: AllDeps,
  publish: boolean,
) => Promise<CreateContextEnrich>;
export interface BatchDispatchResult {
  succeeded: CreateContextEnrich[];
  failed: Array<RepoResult<never> & { index: number }>;
}