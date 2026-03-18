import { type PrecisePrice, type DataLike, type BoolLike, type MintLike, type InsertPairParams, type DecodedCreateEvents } from './imports.js';
import type { EnrichedCreateEvent, CreatePipelineContext, CreateEnrichmentContext } from './types.js';
import type { DecodedCreateEvent } from './types.js';
export declare function coerceCreateEventBigints(raw: Record<string, unknown>): Record<string, unknown>;
/**
 * Type guard for CreateEvent specifically.
 */
export declare function isCreateEvent(x: unknown): x is {
    name: 'CreateEvent';
    category: 'event';
    data: Record<string, unknown>;
};
/**
 * Strict guard for DecodedCreateEvent data shape.
 * Validates all required fields exist with correct types.
 */
export declare function isDecodedCreateEventData(x: unknown): x is DecodedCreateEvents;
export type CreateEventExtractResult = {
    success: true;
    data: DecodedCreateEvents;
} | {
    success: false;
    data: null;
} | {
    success: null;
    data: null;
};
/**
 * Extract and validate DecodedCreateEvent from raw decoder output.
 * Returns null if not a valid CreateEvent.
 */
export declare function extractDecodedCreateEvent(raw: unknown): DecodedCreateEvents | null;
export declare function extractDecodedCreateEventErrorGuard(raw: unknown): {
    success: BoolLike;
    data: DecodedCreateEvent | null | DataLike;
};
/**
 * Calculate initial price from genesis reserves.
 * Price = virtual_sol_reserves / virtual_token_reserves
 */
export declare function initialPriceFromReserves(virtualSol: bigint, virtualToken: bigint): PrecisePrice;
/**
 * Enrich decoded create event with computed values and context.
 * Pure function - no side effects.
 */
export declare function enrichCreateEvent(decoded: DecodedCreateEvents, ctx: CreateEnrichmentContext): EnrichedCreateEvent;
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid CreateEvent.
 */
/**
 * Full pipeline: decoded create event → enriched + insert params.
 *
 * Coerces bigint fields at the boundary — they may have been lost
 * to JSON round-trip through RabbitMQ.  This matches the pattern
 * in processTradeEventErrorGuard / coerceTradeEventBigints.
 */
export declare function processCreateEventErrorGuard(decoded: DecodedCreateEvents, ctx: CreatePipelineContext): {
    decoded: DecodedCreateEvents;
    enriched: EnrichedCreateEvent;
    insertParams: InsertPairParams;
};
/**
 * Extract metadata from enriched event for separate meta table insert.
 * Returns shape compatible with your meta service.
 */
export declare function extractMetadataParams(enriched: EnrichedCreateEvent): {
    mint: MintLike;
    name: string;
    symbol: string;
    uri: string;
};
