// src/imports/interfaces/events/create/utils.ts

import {
  isDecodedResult,
  calculatePrecisePrice,
  type PrecisePrice,
  toInsertPairParams,
  type DataLike,
  type BoolLike,
  type MintLike,
  type InsertPairParams,
} from './imports.js';
import type {
  DecodedCreateEvents,
  EnrichedCreateEvent,
  CreatePipelineContext,
  CreateEnrichmentContext,
  DecodedCreateEvent,
  CreatePipelineResult
} from './types/index.js';
import {CREATE_BIGINT_FIELDS,CREATE_STRING_FIELDS,CREATE_BOOL_FIELDS} from './constants.js';
import {deriveAssociatedBondingCurve,type AddressLike} from '@imports';
// =============================================================================
// BIGINT COERCION (JSON round-trip recovery)
// =============================================================================

/**
 * Field sets for coercion after JSON serialization boundary.
 *
 * RabbitMQ serializes messages with JSON.stringify.  BigInt values either
 * throw or become `undefined` / get dropped entirely.  The decoder's `raw`
 * sub-object stores them as string representations, so we can recover.
 *
 * This mirrors coerceTradeEventBigints — same pattern, different field list.
 */


export function coerceCreateEventBigints(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  const source = (raw.raw as Record<string, unknown>) ?? {};

  for (const key of CREATE_BIGINT_FIELDS) {
    const val = out[key] ?? source[key];
    if (val === undefined || val === null) {
      out[key] = 0n;
      continue;
    }
    out[key] = typeof val === 'bigint' ? val : BigInt(val as string | number);
  }

  for (const key of CREATE_STRING_FIELDS) {
    if (!(key in out) || out[key] === undefined) {
      out[key] = source[key] ?? '';
    }
  }

  for (const key of CREATE_BOOL_FIELDS) {
    if (!(key in out) || out[key] === undefined) {
      out[key] = source[key] ?? false;
    }
  }

  return out;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for CreateEvent specifically.
 */
export function isCreateEvent(x: unknown): x is {
  name: 'CreateEvent';
  category: 'event';
  data: Record<string, unknown>;
} {
  return isDecodedResult(x) && x.name === 'CreateEvent' && x.category === 'event';
}

/**
 * Strict guard for DecodedCreateEvent data shape.
 * Validates all required fields exist with correct types.
 */
export function isDecodedCreateEventData(x: unknown): x is DecodedCreateEvents {
  return (
    x !== null &&
    typeof x === 'object' &&
    typeof (x as any).mint === 'string' &&
    typeof (x as any).name === 'string' &&
    typeof (x as any).symbol === 'string' &&
    typeof (x as any).uri === 'string' &&
    typeof (x as any).creator === 'string' &&
    typeof (x as any).timestamp === 'bigint' &&
    typeof (x as any).virtual_sol_reserves === 'bigint' &&
    typeof (x as any).virtual_token_reserves === 'bigint'
  );
}

export type CreateEventExtractResult =
  | { success: true; data: DecodedCreateEvents }
  | { success: false; data: null }
  | { success: null; data: null };
// =============================================================================
// LAYER 1: EXTRACT
// =============================================================================

/**
 * Extract and validate DecodedCreateEvent from raw decoder output.
 * Returns null if not a valid CreateEvent.
 */
export function extractDecodedCreateEvent(
  raw: unknown
): DecodedCreateEvents | null {
  if (!isCreateEvent(raw)) {
    return null;
  }

  if (!isDecodedCreateEventData(raw.data)) {
    console.warn(
      'extractDecodedCreateEvent: data shape invalid',
      JSON.stringify(raw.data, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    );
    return null;
  }

  return raw.data;
}
export function extractDecodedCreateEventErrorGuard(
  raw: unknown
):{success:BoolLike,data: DecodedCreateEvent | null | DataLike}{
  if (!isCreateEvent(raw)) {
    return { success: null, data: null };
  }

  let success = true
  let data = raw.data
  if (data.decodable == false){
    success=false
  }
  return {success,data}
}


// =============================================================================
// LAYER 2: ENRICH
// =============================================================================

/**
 * Calculate initial price from genesis reserves.
 * Price = virtual_sol_reserves / virtual_token_reserves
 */
export function initialPriceFromReserves(
  virtualSol: bigint,
  virtualToken: bigint
): PrecisePrice {
  return calculatePrecisePrice(virtualSol, virtualToken);
}

/**
 * Enrich decoded create event with computed values and context.
 * Pure function - no side effects.
 */
export function enrichCreateEvent(
  decoded: DecodedCreateEvents,
  ctx: CreateEnrichmentContext
): EnrichedCreateEvent {
  const initial_price = initialPriceFromReserves(
    decoded.virtual_sol_reserves,
    decoded.virtual_token_reserves
  );
  const timestamp = new Date(Number(decoded.timestamp) * 1000);
  const bonding_curve = ctx.bonding_curve;
  const associated_bonding_curve = ctx.associated_bonding_curve;
  const signature = ctx.signature;
  const program_id = ctx.program_id;
  return {
    // context passthrough
    signature: signature,
    slot: ctx.slot,
    program_id: program_id,
    invocation:ctx.invocation,
    log_id: ctx.log_id,
    meta_id: ctx.meta_id,
    txn_id: ctx.txn_id,
    bonding_curve:bonding_curve,
    associated_bonding_curve: associated_bonding_curve,

    // decoded reference
    decoded,

    // computed
    initial_price,
    timestamp,

    // metadata extract
    metadata: {
      
      mint: decoded.mint,
      name: decoded.name,
      symbol: decoded.symbol,
      user_address: decoded.user,
      creator: decoded.creator,
      signature,
      bonding_curve,
      associated_bonding_curve,
      program_id,
      timestamp,
      uri: decoded.uri,

    },
  };
}
   

// =============================================================================
// FULL PIPELINE
// =============================================================================

/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid CreateEvent.
 */
/*export function processCreateEvent(
  raw: unknown,
  ctx: CreatePipelineContext
): CreatePipelineResult | null {
  // Layer 1: Extract
  const decoded = extractDecodedCreateEvent(raw);
  if (!decoded) {
    return null;
  }

  return processCreateEventErrorGuard(decoded,ctx);
}*/

/**
 * Full pipeline: decoded create event → enriched + insert params.
 *
 * Coerces bigint fields at the boundary — they may have been lost
 * to JSON round-trip through RabbitMQ.  This matches the pattern
 * in processTradeEventErrorGuard / coerceTradeEventBigints.
 */
export function processCreateEventErrorGuard(
  decoded: DecodedCreateEvents,
  ctx: CreatePipelineContext
):CreatePipelineResult{
  // ── Coerce at the boundary — bigints lost to JSON round-trip ──
  const safe = coerceCreateEventBigints(
    decoded.raw as unknown as Record<string, unknown>
  ) as unknown as DecodedCreateEvents;

  // Layer 2: Enrich
  const enriched = enrichCreateEvent(safe, ctx);

  // Layer 3: To DB params
  const insertParams = toInsertPairParams(enriched);

  return { decoded: safe, enriched, insertParams, result:{} };
}

// =============================================================================
// METADATA EXTRACT (for meta table pipeline)
// =============================================================================

/**
 * Extract metadata from enriched event for separate meta table insert.
 * Returns shape compatible with your meta service.
 */
export function extractMetadataParams(enriched: EnrichedCreateEvent): {
  mint: MintLike;
  name: string;
  symbol: string;
  uri: string;
} {
  enriched.metadata.mint ??=  enriched.decoded.mint
  return enriched.metadata;
}

