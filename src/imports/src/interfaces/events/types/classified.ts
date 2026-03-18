import type {
  DecodedTradeEvents,
  DecodedCreateEvents,
  DecodedUnknownEvent,
  CreatePipelineResult,
  TradePipelineResult
} from './../src/index.js';
import {EventKind} from './../src/index.js';
import type {SigLike} from './../imports.js'; 

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
}

// ============================================================
// TYPE GUARDS (narrowing without casting)
// ============================================================

export function isTradeEvent(e: ClassifiedEvent): e is DecodedTradeEvents {
  return e.kind === EventKind.TRADE;
}

export function isUnknownEvent(e: ClassifiedEvent): e is DecodedUnknownEvent {
  return e.kind === EventKind.UNKNOWN;
}

export type DecodedEvent =
  | DecodedTradeEvents
  | { kind: typeof EventKind.CREATE }
  | { kind: typeof EventKind.UNKNOWN };

// ============================================================
// NORMALIZE
// ============================================================

export type NormalizeResult =
  | { ok: true;  event: DecodedEvent }
  | { ok: false; skipped: true; name: string }
  | { ok: false; skipped: false; name: string; reason: string };


export interface NormalizedEvents {
  events: DecodedEvent[];
  skipped: string[];
  unknown: string[];
} 

export interface EventsLog{
  trades:TradePipelineResult[],
  creates:CreatePipelineResult[],
  unknown:DecodedUnknownEvent[],
}