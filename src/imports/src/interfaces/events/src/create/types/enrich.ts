// src/imports/interfaces/events/create/types.ts

import type {
  PrecisePrice,
  IntLike,
  SigLike,
  IdLike,
  MintLike,
  AddressLike
} from './imports.js';
import type { DecodedCreateEvents } from './decode.js';
// =============================================================================
// LAYER 2: ENRICHMENT CONTEXT
// =============================================================================

export interface CreateEnrichmentContext {
  // chain context (from transaction envelope)
  signature?: SigLike;
  slot?: IntLike;
  program_id?: AddressLike;  // launchpad program, canonical from websocket
  invocation?: IntLike;
  // provenance IDs (optional at enrichment time)
  log_id?: IdLike;
  meta_id?: IdLike;
  txn_id?: IdLike;

  // derived later (PDA lookup)
  bonding_curve?: AddressLike;
  associated_bonding_curve?: AddressLike;
}
// =============================================================================
// LAYER 2: ENRICHED (computed/derived values)
// =============================================================================
export interface EnrichedCreateMetaDataInsert {
    mint: MintLike,
    name: string,
    symbol: string,
    discriminator?: string,
    token_program?:AddressLike,
    uri: string,
    user_address?: AddressLike,        // ❌ OPTIONAL
    creator?: AddressLike,     // ❌ OPTIONAL
    signature?: SigLike,
    bonding_curve?: AddressLike,
    associated_bonding_curve?: AddressLike,
    program_id?: AddressLike,
    timestamp?: Date | null;
  };
/**
 * Enriched create event with computed values.
 * Keeps reference to original decoded data for audit trail.
 */
export interface EnrichedCreateEvent extends CreateEnrichmentContext {
  // original decoded data (immutable reference)
  decoded: DecodedCreateEvents;

  // computed values
  initial_price: PrecisePrice;
  timestamp: Date;
  metadata:EnrichedCreateMetaDataInsert

}



