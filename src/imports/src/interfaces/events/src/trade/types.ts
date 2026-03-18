import type {
  TransactionsInsertParams,
  PrecisePrice,
  IntLike,
  SigLike,
  IdLike,
  MintLike,
  AddressLike,
  DecodeProvenance,
  ProcessResult
} from './imports.js';
import {EventKind} from './imports.js';
// =============================================================================
// LAYER 1: DECODED (chain truth, no derivation)
// =============================================================================

/**
 * Raw decoded output from TradeEvent.
 * All values as they come off the wire - bigints stay bigints.
 * No computation happens here.
 */
export interface DecodedTradeEvent {
  // identity
  mint?: MintLike;
  user?: AddressLike;
  user_address?: AddressLike;
  raw?:any;
  slot?:IntLike;
  invocation?:IntLike;
  // amounts (raw bigint from chain)
  sol_amount: bigint;
  token_amount: bigint;
  
  // AMM state
  virtual_sol_reserves: bigint;
  virtual_token_reserves: bigint;
  real_sol_reserves: bigint;
  real_token_reserves: bigint;
  
  // trade semantics
  is_buy: boolean;
  ix_name: TradeInstruction;
  mayhem_mode: boolean;
  
  // volume tracking
  track_volume: boolean;
  total_unclaimed_tokens: IntLike;
  total_claimed_tokens: IntLike;
  current_sol_volume: IntLike;
  
  // fees
  fee_recipient: AddressLike;
  fee_basis_points: IntLike;
  fee: IntLike;
  
  // creator
  creator: AddressLike;
  creator_fee_basis_points: IntLike;
  creator_fee: IntLike;
  
  // time
  timestamp: IntLike;
  last_update_timestamp: IntLike;
}
// ============================================================
// TRADE EVENT (decoded + typed)
// ============================================================
export interface DecodedTradeEvents extends DecodedTradeEvent{
  readonly kind: typeof EventKind.TRADE;
  readonly provenance: DecodeProvenance;
  /* Raw decoded data for passthrough — everything the registry emitted*/
  readonly raw: Record<string, unknown>;
} 
// =============================================================================
// LAYER 2 → LAYER 3: Enrich
// =============================================================================
export interface TransactionEnrichmentContext {
  // chain context (from transaction envelope)
  signature?: SigLike;
  slot?: IntLike;
  program_id?: AddressLike;
  invocation_index?: IntLike;
  invocation?: IntLike;
  mint?:MintLike;
  pairEnrich?: boolean;
  metaEnrich?: boolean;
  // provenance IDs
  log_id?: IdLike;
  pair_id?: IdLike;
  meta_id?: IdLike;
}
// =============================================================================
// LAYER 2: ENRICHED (computed/derived values)
// =============================================================================
/**
 * Enriched trade with computed values.
 * This is where price calculation, UI formatting, etc. happen.
 * Keeps reference to original decoded data for audit trail.
 */
export interface EnrichedTrade extends TransactionEnrichmentContext,DecodedTradeEvents{
  // original decoded data (immutable reference)
  decoded: DecodedTradeEvent;
  // computed values
  price: PrecisePrice;
  // UI-friendly amounts (for display, not persistence)
  sol_amount_ui: IntLike;
  token_amount_ui: IntLike;
}
export interface TradePipelineContext extends TransactionEnrichmentContext {}
// =============================================================================
// FULL PIPELINE
// =============================================================================
export interface TradePipelineResult {
  decoded: DecodedTradeEvents;
  enriched: EnrichedTrade;
  insertParams: TransactionsInsertParams;
  result?: any;
}
export type TradeInstruction =
  | 'buy_exact_sol_in'
  | 'buy_exact_token_out'
  | 'sell_exact_token_in'
  | 'sell_exact_sol_out';