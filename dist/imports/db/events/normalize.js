/**
 * EVENT NORMALIZATION
 *
 * Bridges raw decoder output ({ name, data }) into typed DecodedEvent
 * with the `kind` discriminant set correctly.
 *
 * This is the ONLY place that knows about name → kind mapping.
 * Downstream dispatch is purely kind-based.
 */
import { EventKind } from '@imports';
// ============================================================
// NAME → KIND MAP (single source of truth)
// ============================================================
const NAME_TO_KIND = {
    TradeEvent: EventKind.TRADE,
    CreateEvent: EventKind.CREATE,
};
// Events we know about but intentionally skip — not failures
const KNOWN_SKIP = new Set([
    'ExtendAccountEvent',
]);
export function normalizeRawEvent(raw, provenance) {
    const { name, data } = raw;
    if (KNOWN_SKIP.has(name)) {
        return { ok: false, skipped: true, name };
    }
    const kind = NAME_TO_KIND[name];
    if (!kind) {
        return { ok: false, skipped: false, name, reason: 'unknown_event_name' };
    }
    // Spread data + inject kind + attach provenance if supplied
    const event = {
        ...data,
        kind,
        ...(provenance ? { provenance } : {}),
    };
    return { ok: true, event };
}
export function normalizeRawEvents(raws, provenance) {
    const events = [];
    const skipped = [];
    const unknown = [];
    for (const raw of raws) {
        const result = normalizeRawEvent(raw, provenance);
        if (result.ok) {
            events.push(result.event);
        }
        else if (result.skipped) {
            skipped.push(result.name);
        }
        else {
            unknown.push(result.name);
        }
    }
    return { events, skipped, unknown };
}
