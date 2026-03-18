/**
 * EVENT NORMALIZATION
 *
 * Bridges raw decoder output ({ name, data }) into typed DecodedEvent
 * with the `kind` discriminant set correctly.
 *
 * This is the ONLY place that knows about name → kind mapping.
 * Downstream dispatch is purely kind-based.
 */
import type { DecodedEvent } from '@imports';
export interface RawDecodedEntry {
    name: string;
    category: string;
    data: Record<string, unknown>;
}
export type NormalizeResult = {
    ok: true;
    event: DecodedEvent;
} | {
    ok: false;
    skipped: true;
    name: string;
} | {
    ok: false;
    skipped: false;
    name: string;
    reason: string;
};
export declare function normalizeRawEvent(raw: RawDecodedEntry, provenance?: Record<string, unknown>): NormalizeResult;
export declare function normalizeRawEvents(raws: RawDecodedEntry[], provenance?: Record<string, unknown>): {
    events: DecodedEvent[];
    skipped: string[];
    unknown: string[];
};
