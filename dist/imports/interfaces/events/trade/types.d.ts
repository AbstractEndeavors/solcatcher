import type { TransactionsInsertParams, PrecisePrice, IntLike, SigLike, IdLike, MintLike, AddressLike } from './imports.js';
/**
 * Raw decoded output from TradeEvent.
 * All values as they come off the wire - bigints stay bigints.
 * No computation happens here.
 */
export interface DecodedTradeEvent {
    mint?: MintLike;
    user?: AddressLike;
    user_address?: AddressLike;
    raw?: any;
    slot?: IntLike;
    invocation?: IntLike;
    sol_amount: bigint;
    token_amount: bigint;
    virtual_sol_reserves: bigint;
    virtual_token_reserves: bigint;
    real_sol_reserves: bigint;
    real_token_reserves: bigint;
    is_buy: boolean;
    ix_name: TradeInstruction;
    mayhem_mode: boolean;
    track_volume: boolean;
    total_unclaimed_tokens: IntLike;
    total_claimed_tokens: IntLike;
    current_sol_volume: IntLike;
    fee_recipient: AddressLike;
    fee_basis_points: IntLike;
    fee: IntLike;
    creator: AddressLike;
    creator_fee_basis_points: IntLike;
    creator_fee: IntLike;
    timestamp: IntLike;
    last_update_timestamp: IntLike;
}
export interface DecodeProvenance {
    readonly payload_id: IdLike;
    readonly signature: SigLike;
    readonly program_id: AddressLike;
    readonly discriminator: string;
    readonly invocation_index: IntLike;
    readonly depth: IntLike;
}
export declare const EventKind: {
    readonly TRADE: "trade";
    readonly CREATE: "create";
    readonly UNKNOWN: "unknown";
};
export type EventKindValue = (typeof EventKind)[keyof typeof EventKind];
export interface DecodedTradeEvents extends DecodedTradeEvent {
    readonly kind: typeof EventKind.TRADE;
    readonly provenance: DecodeProvenance;
    readonly raw: Record<string, unknown>;
}
export interface TransactionEnrichmentContext {
    signature?: SigLike;
    slot?: IntLike;
    program_id?: AddressLike;
    invocation_index?: IntLike;
    invocation?: IntLike;
    mint?: MintLike;
    pairEnrich?: boolean;
    metaEnrich?: boolean;
    log_id?: IdLike;
    pair_id?: IdLike;
    meta_id?: IdLike;
}
/**
 * Enriched trade with computed values.
 * This is where price calculation, UI formatting, etc. happen.
 * Keeps reference to original decoded data for audit trail.
 */
export interface EnrichedTrade extends TransactionEnrichmentContext, DecodedTradeEvents {
    decoded: DecodedTradeEvent;
    price: PrecisePrice;
    sol_amount_ui: IntLike;
    token_amount_ui: IntLike;
}
export interface TradePipelineContext extends TransactionEnrichmentContext {
}
export interface TradePipelineResult {
    decoded: DecodedTradeEvents;
    enriched: EnrichedTrade;
    insertParams: TransactionsInsertParams;
}
export type TradeInstruction = 'buy_exact_sol_in' | 'buy_exact_token_out' | 'sell_exact_token_in' | 'sell_exact_sol_out';
