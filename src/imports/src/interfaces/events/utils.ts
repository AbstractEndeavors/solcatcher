import type {NormalizeResult,DecodedEvent,NormalizedEvents} from './types/index.js';
import {KNOWN_SKIP,NAME_TO_KIND} from './src/index.js';
import type {RawDecodedEntry} from './imports.js';

export function normalizeRawEvent(
  raw: RawDecodedEntry,
  provenance?: Record<string, unknown>,
): NormalizeResult {
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
  } as DecodedEvent;

  return { ok: true, event };
}

export function normalizeRawEvents(
  raws: RawDecodedEntry[],
  provenance?: Record<string, unknown>,
): NormalizedEvents{
  const events: DecodedEvent[] = [];
  const skipped: string[] = [];
  const unknown: string[] = [];

  for (const raw of raws) {
    const result = normalizeRawEvent(raw, provenance);

    if (result.ok) {
      events.push(result.event);
    } else if (result.skipped) {
      skipped.push(result.name);
    } else {
      unknown.push(result.name);
    }
  }

  return { events, skipped, unknown };
}
