import type {IdLike,SigLike,AddressLike,IntLike} from './../imports.js';
import type {CreateContextEnrich,GenesisEntryPayload} from './../../index.js'
export type ProcessResultKind = 'trade' | 'create' | 'unknown' | 'error' | 'empty';
export const EventKind = {
  TRADE: 'trade',
  CREATE: 'create',
  UNKNOWN: 'unknown',
} as const;

export type EventKindValue = (typeof EventKind)[keyof typeof EventKind];

export interface ProcessResult {
  kind: string;
  log_id: IdLike;
  pair_id?: IdLike;
  meta_id?: IdLike;
  txn_id?: IdLike;
  error?: string;
}
export interface DecodeProvenance {
  readonly payload_id: IdLike;
  readonly signature: SigLike;
  readonly program_id: AddressLike;
  readonly discriminator: string;
  readonly invocation_index: IntLike;
  readonly depth: IntLike;
}



// ============================================================
// NAME → KIND MAP (single source of truth)
// ============================================================

export const NAME_TO_KIND: Record<string, EventKindValue> = {
  TradeEvent:  EventKind.TRADE,
  CreateEvent: EventKind.CREATE,
};

// Events we know about but intentionally skip — not failures
export const KNOWN_SKIP = new Set([
  'ExtendAccountEvent',
]);
