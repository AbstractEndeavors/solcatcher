// src/imports/interfaces/events/create/utils.ts
import { isDecodedResult, calculatePrecisePrice, toInsertPairParams, } from './imports.js';
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
const CREATE_BIGINT_FIELDS = new Set([
    'virtual_token_reserves',
    'virtual_sol_reserves',
    'real_token_reserves',
    'token_total_supply',
    'timestamp',
]);
const CREATE_STRING_FIELDS = new Set([
    'mint',
    'bonding_curve',
    'token_program',
    'user',
    'creator',
    'name',
    'symbol',
    'uri',
]);
const CREATE_BOOL_FIELDS = new Set([
    'is_mayhem_mode',
]);
export function coerceCreateEventBigints(raw) {
    const out = { ...raw };
    const source = raw.raw ?? {};
    for (const key of CREATE_BIGINT_FIELDS) {
        const val = out[key] ?? source[key];
        if (val === undefined || val === null) {
            out[key] = 0n;
            continue;
        }
        out[key] = typeof val === 'bigint' ? val : BigInt(val);
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
export function isCreateEvent(x) {
    return isDecodedResult(x) && x.name === 'CreateEvent' && x.category === 'event';
}
/**
 * Strict guard for DecodedCreateEvent data shape.
 * Validates all required fields exist with correct types.
 */
export function isDecodedCreateEventData(x) {
    return (x !== null &&
        typeof x === 'object' &&
        typeof x.mint === 'string' &&
        typeof x.name === 'string' &&
        typeof x.symbol === 'string' &&
        typeof x.uri === 'string' &&
        typeof x.creator === 'string' &&
        typeof x.timestamp === 'bigint' &&
        typeof x.virtual_sol_reserves === 'bigint' &&
        typeof x.virtual_token_reserves === 'bigint');
}
// =============================================================================
// LAYER 1: EXTRACT
// =============================================================================
/**
 * Extract and validate DecodedCreateEvent from raw decoder output.
 * Returns null if not a valid CreateEvent.
 */
export function extractDecodedCreateEvent(raw) {
    if (!isCreateEvent(raw)) {
        return null;
    }
    if (!isDecodedCreateEventData(raw.data)) {
        console.warn('extractDecodedCreateEvent: data shape invalid', JSON.stringify(raw.data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
        return null;
    }
    return raw.data;
}
export function extractDecodedCreateEventErrorGuard(raw) {
    if (!isCreateEvent(raw)) {
        return { success: null, data: null };
    }
    let success = true;
    let data = raw.data;
    if (data.decodable == false) {
        success = false;
    }
    return { success, data };
}
// =============================================================================
// LAYER 2: ENRICH
// =============================================================================
/**
 * Calculate initial price from genesis reserves.
 * Price = virtual_sol_reserves / virtual_token_reserves
 */
export function initialPriceFromReserves(virtualSol, virtualToken) {
    return calculatePrecisePrice(virtualSol, virtualToken);
}
/**
 * Enrich decoded create event with computed values and context.
 * Pure function - no side effects.
 */
export function enrichCreateEvent(decoded, ctx) {
    const initial_price = initialPriceFromReserves(decoded.virtual_sol_reserves, decoded.virtual_token_reserves);
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
        invocation: ctx.invocation,
        log_id: ctx.log_id,
        meta_id: ctx.meta_id,
        txn_id: ctx.txn_id,
        bonding_curve: bonding_curve,
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
// LAYER 3: TO INSERT PARAMS
// =============================================================================
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
export function processCreateEventErrorGuard(decoded, ctx) {
    // ── Coerce at the boundary — bigints lost to JSON round-trip ──
    const safe = coerceCreateEventBigints(decoded.raw);
    // Layer 2: Enrich
    const enriched = enrichCreateEvent(safe, ctx);
    // Layer 3: To DB params
    const insertParams = toInsertPairParams(enriched);
    return { decoded: safe, enriched, insertParams };
}
// =============================================================================
// METADATA EXTRACT (for meta table pipeline)
// =============================================================================
/**
 * Extract metadata from enriched event for separate meta table insert.
 * Returns shape compatible with your meta service.
 */
export function extractMetadataParams(enriched) {
    enriched.metadata.mint ??= enriched.decoded.mint;
    return enriched.metadata;
}
