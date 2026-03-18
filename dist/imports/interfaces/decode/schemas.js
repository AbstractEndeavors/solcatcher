/**
 * DECODED EVENT SCHEMAS
 *
 * Explicit contracts for every decode output.
 * No ad-hoc objects — the classifier emits these, consumers depend on these.
 *
 * Pattern: Schemas over ad-hoc objects
 */
export {};
// ============================================================
// CLASSIFICATION ENUM (Registry, not string comparison)
// ============================================================
/*export const EventKind = {
  TRADE: 'trade',
  CREATE: 'create',
  UNKNOWN: 'unknown',
} as const;

export type EventKindValue = (typeof EventKind)[keyof typeof EventKind];

// ============================================================
// PROVENANCE — where the decode came from
// ============================================================

export interface DecodeProvenance {
  readonly payload_id: IdLike;
  readonly signature: SigLike;
  readonly program_id: AddressLike;
  readonly discriminator: string;
  readonly invocation_index: IntLike;
  readonly depth: IntLike;
}

// ============================================================
// TRADE EVENT (decoded + typed)
// ============================================================

/*interface DecodedTradeEvents extends DecodedTradeEvent{
  readonly kind: typeof EventKind.TRADE;
  readonly provenance: DecodeProvenance;


  /** Raw decoded data for passthrough — everything the registry emitted
  readonly raw: Record<string, unknown>;
}

// ============================================================
// CREATE EVENT (decoded + typed)
// ============================================================

interface DecodedCreateEvents extends DecodedCreateEvent {
  readonly kind: typeof EventKind.CREATE;
  readonly provenance: DecodeProvenance;


  * Raw decoded data for passthrough
  readonly raw: Record<string, unknown>;
}

// ============================================================
// UNKNOWN EVENT (decodable but unclassified)
// ============================================================

export interface DecodedUnknownEvent {
  readonly kind: typeof EventKind.UNKNOWN;
  readonly provenance: DecodeProvenance;
  readonly discriminator: string;
  readonly raw: Record<string, unknown>;
}

// ============================================================
// UNION — the only type consumers need
// ============================================================

export type ClassifiedEvent =
  | DecodedTradeEvents
  | DecodedCreateEvents
  | DecodedUnknownEvent;

// ============================================================
// BATCH RESULT — what the pipeline returns
// ============================================================

export interface DecodeBatchResult {
  readonly signature: SigLike;
  readonly events: ClassifiedEvent[];
  readonly trade_count: number;
  readonly create_count: number;
  readonly unknown_count: number;
  readonly skipped_count: number;
}*/
// ============================================================
// TYPE GUARDS (narrowing without casting)
// ============================================================
/*export function isTradeEvent(e: ClassifiedEvent): e is DecodedTradeEvents {
  return e.kind === EventKind.TRADE;
}

export function isCreateEvent(e: ClassifiedEvent): e is DecodedCreateEvents {
  return e.kind === EventKind.CREATE;
}

export function isUnknownEvent(e: ClassifiedEvent): e is DecodedUnknownEvent {
  return e.kind === EventKind.UNKNOWN;
}

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
*/
