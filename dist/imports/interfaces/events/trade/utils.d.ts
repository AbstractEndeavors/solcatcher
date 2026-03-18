import { type PrecisePrice, type TransactionsInsertDTO, type BoolLike, type DataLike, TransactionsInsertParams, type DecodedTradeEvents } from './imports.js';
import type { EnrichedTrade, TransactionEnrichmentContext, TradePipelineResult } from './types.js';
export declare function coerceTradeEventBigints(raw: Record<string, unknown>): Record<string, unknown>;
/**
 * Strict guard for DecodedTradeEvent data shape.
 * Validates all required fields exist with correct types.
 */
export declare function isDecodedTradeEventData(d: unknown): d is DecodedTradeEvents;
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.
 */
export declare function extractDecodedTradeEvent(raw: unknown): DecodedTradeEvents | null;
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.
 */
export declare function extractDecodedTradeEventErrorGuard(raw: unknown): {
    success: BoolLike;
    data: DecodedTradeEvents | null | DataLike;
};
/**
 * Calculate price from decoded trade event.
 */
export declare function priceFromDecodedEvent(decoded: DecodedTradeEvents): PrecisePrice;
/**
 * Enrich decoded trade event with computed values and context.
 * Pure function - no side effects.
 */
export declare function enrichTradeEvent(decoded: DecodedTradeEvents, ctx: TransactionEnrichmentContext): EnrichedTrade;
/**
 * Convert enriched trade to DB-ready insert params.
 * All bigints → strings for NUMERIC columns.
 */
export declare function toInsertParams(enriched: EnrichedTrade): TransactionsInsertDTO;
export declare function toTransactionInsertParams(enriched: EnrichedTrade): TransactionsInsertParams;
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid TradeEvent.
 * Throws if DB validation fails (indicates bug in pipeline).
 */
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid CreateEvent.
 */
export declare function preProcessTradeEvent(raw: unknown, ctx: TransactionEnrichmentContext): TradePipelineResult | null;
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid CreateEvent.
 */
export declare function processTradeEventErrorGuard(decoded: DecodedTradeEvents, ctx: TransactionEnrichmentContext): TradePipelineResult;
