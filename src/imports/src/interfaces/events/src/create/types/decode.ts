// src/imports/interfaces/events/create/types.ts

import type {
  IntLike,
  MintLike,
  AddressLike,
  DecodeProvenance,
  EventKind
} from './imports.js';
// =============================================================================
// LAYER 1: DECODED (chain truth, no derivation)
// =============================================================================
/**
 * Raw decoded output from CreateEvent.
 * All values as they come off the wire - bigints stay bigints.
 * No computation happens here.
 */
export interface DecodedCreateEvent {
  discriminato?:any;
  // metadata (goes to meta table, referenced here)
  name: string;
  symbol: string;
  uri: string;
  description: string;
  slot?: IntLike;
  // identity
  mint: MintLike;
  bonding_curve: AddressLike;
  token_program: AddressLike;

  // actors
  user: string | null;
  creator: string | null;

  // genesis reserves (raw bigint from chain)
  virtual_token_reserves: bigint;
  virtual_sol_reserves: bigint;
  real_token_reserves: bigint;
  token_total_supply: bigint;

  // time
  timestamp: Date;

  // flags
  is_mayhem_mode: boolean;
}
// ============================================================
// CREATE EVENT (decoded + typed)
// ============================================================

export interface DecodedCreateEvents extends DecodedCreateEvent {
  readonly kind: typeof EventKind.CREATE;
  readonly provenance: DecodeProvenance;


  /** Raw decoded data for passthrough */
  readonly raw: Record<string, unknown>;
}
