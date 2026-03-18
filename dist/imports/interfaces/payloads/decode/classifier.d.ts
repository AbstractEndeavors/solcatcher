/**
 * CLASSIFIER
 *
 * Pure function: raw decoded registry output → ClassifiedEvent.
 * No DB access. No side effects. No orchestration.
 *
 * This is the single place where "is this a trade or a create?" lives.
 * The enricher, the orchestrator, the decode workflow — none of them
 * do this check anymore. They call classify().
 *
 * Pattern: Registries over globals (the decode registry is injected)
 */
import type { LogPayloadRow } from './imports.js';
import { type ClassifiedEvent } from '@imports';
/**
 * Takes a LogPayloadRow + the decode registry, returns a ClassifiedEvent.
 *
 * Returns null only when the payload is not decodable at all
 * (missing b64, decodable===false, registry returns garbage).
 *
 * For payloads that decode but match no known event shape,
 * returns DecodedUnknownEvent — the consumer decides what to do.
 */
export declare function classifyPayload(row: LogPayloadRow, registry: {
    decode: (buf: Buffer) => unknown;
}): ClassifiedEvent | null;
export declare function classifyPayloadBatch(rows: LogPayloadRow[], registry: {
    decode: (buf: Buffer) => unknown;
}): {
    events: ClassifiedEvent[];
    skipped: number;
};
