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
import type { EventKindValue, CreateContextEnrich, ClassifiedEvent } from '@imports';
import type { RepoResult } from '@imports';
import type { AllDeps } from '@repoServices';
export declare function dispatchEvent(event: ClassifiedEvent, deps?: AllDeps | null, publish?: boolean): Promise<RepoResult<CreateContextEnrich>>;
export declare function dispatchEventBatch(events: ClassifiedEvent[], deps?: AllDeps | null, publish?: boolean): Promise<BatchDispatchResult>;
/**
 * Register a processor for a new event kind at wiring time.
 * Call this in your bootstrap/factory — not lazily.
 *
 * Example:
 *   registerProcessor(EventKind.EXTEND, processExtendEvent);
 */
export declare function registerProcessor<E extends ClassifiedEvent>(kind: EventKindValue, processor: EventProcessor<E>): void;
/**
 * Read-only snapshot of registered kinds — for diagnostics/startup checks.
 */
export declare function getRegisteredKinds(): EventKindValue[];
export type EventProcessor<E extends ClassifiedEvent = ClassifiedEvent> = (event: E, deps: AllDeps | null, publish: boolean) => Promise<CreateContextEnrich>;
export interface BatchDispatchResult {
    succeeded: CreateContextEnrich[];
    failed: Array<RepoResult<never> & {
        index: number;
    }>;
}
