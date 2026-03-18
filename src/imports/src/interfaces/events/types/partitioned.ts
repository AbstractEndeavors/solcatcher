import type {DecodedTradeEvents,DecodedCreateEvents,DecodedUnknownEvent} from './../src/index.js';
import {EventKind} from './../src/index.js';
import type {ClassifiedEvent} from './classified.js';
// ============================================================
// PARTITION HELPER — split a batch into typed buckets
// ============================================================

export interface PartitionedEvents {
  trades: DecodedTradeEvents[];
  creates: DecodedCreateEvents[];
  unknowns: DecodedUnknownEvent[];
}

export function partitionEvents(events: ClassifiedEvent[]): PartitionedEvents {
  const trades: DecodedTradeEvents[] = [];
  const creates: DecodedCreateEvents[] = [];
  const unknowns: DecodedUnknownEvent[] = [];

  for (const e of events) {
    switch (e.kind) {
      case EventKind.TRADE:
        trades.push(e);
        break;
      case EventKind.CREATE:
        creates.push(e);
        break;
      case EventKind.UNKNOWN:
        unknowns.push(e);
        break;
    }
  }

  return { trades, creates, unknowns };
}

