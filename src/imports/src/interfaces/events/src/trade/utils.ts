import {
  type PrecisePrice,
  type TransactionsInsertDTO,
  type BoolLike,
  type DataLike,
  type DecodedTradeEvents,
  isDecodedResult,
  calculatePrecisePrice, 
  lamportsToSol,
  toUiAmount,
  TransactionsInsertParams,
  isDbSafeInsertTransactionsParams,
  isBool,
  isAddress,
  isId
} from './imports.js';
import type {
  EnrichedTrade,
  TransactionEnrichmentContext,
  TradePipelineResult
} from './types.js';
const BUY_IX = new Set([
  'buy',
  'buy_exact_sol_in',
  'buy_exact_token_out',
]);

const SELL_IX = new Set([
  'sell',
  'sell_exact_token_in',
  'sell_exact_sol_out',
]);
const BIGINT_FIELDS: ReadonlySet<string> = new Set([
    'sol_amount', 'token_amount',
    'virtual_sol_reserves', 'virtual_token_reserves',
    'real_sol_reserves', 'real_token_reserves',
    'total_unclaimed_tokens', 'total_claimed_tokens',
    'current_sol_volume',
    'fee_basis_points', 'fee',
    'creator_fee_basis_points', 'creator_fee',
    'timestamp', 'last_update_timestamp',
]);
const STRING_FIELDS: ReadonlySet<string> = new Set([
    'fee_recipient', 'creator',
]);
const BOOL_FIELDS: ReadonlySet<string> = new Set([
    'mayhem_mode', 'track_volume',
]);

export function coerceTradeEventBigints(
    raw: Record<string, unknown>
): Record<string, unknown> {
    const out: Record<string, unknown> = { ...raw };
    const source = (raw.raw as Record<string, unknown>) ?? {};

    for (const key of BIGINT_FIELDS) {
        const val = out[key] ?? source[key];
        if (val === undefined || val === null) {
            out[key] = 0n;
            continue;
        }
        out[key] = typeof val === 'bigint' ? val : BigInt(val as string | number);
    }

    for (const key of STRING_FIELDS) {
        if (!(key in out) || out[key] === undefined) {
            out[key] = source[key] ?? '';
        }
    }

    for (const key of BOOL_FIELDS) {
        if (!(key in out) || out[key] === undefined) {
            out[key] = source[key] ?? false;
        }
    }

    return out;
}
function deriveIsBuy(ix: string): boolean {
  if (BUY_IX.has(ix)) return true;
  if (SELL_IX.has(ix)) return false;
  throw new Error(`Unknown trade ix_name: ${ix}`);
}

/**isNumber
 * Type guard for TradeEvent specifically.
 */
function isTradeEvent(x: unknown): x is { 
  name: 'TradeEvent'; 
  category: 'event'; 
  data: Record<string, unknown> 
} {
  return isDecodedResult(x) && x.name === 'TradeEvent' && x.category === 'event';
}
/**
 * Strict guard for DecodedTradeEvent data shape.
 * Validates all required fields exist with correct types.
 */
export function isDecodedTradeEventData(d: unknown): d is DecodedTradeEvents {
  if (!d || typeof d !== 'object') return false;
  const obj = d as Record<string, unknown>;
  
  // string fields
  const strings = ['mint', 'user', 'fee_recipient', 'creator'];
  for (const k of strings) {
    if (!isAddress(obj[k])) return false;
  }

  // bigint fields (decoder returns bigint)
  const bigints = BIGINT_FIELDS;
  for (const k of bigints) {
    if (!isId(obj[k])) return false;
  }
  // boolean fields
  const bools = ['is_buy', 'mayhem_mode', 'track_volume'];
  for (const k of bools) {
    if (!isBool(obj[k])) return false;
  }
  
  // ix_name enum
  if (obj.is_buy !== deriveIsBuy(obj.ix_name as string)) return false;

  return true;
}
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.
 */
export function extractDecodedTradeEvent(
  raw: unknown
): DecodedTradeEvents | null {
  if (!isTradeEvent(raw)) {
    return null;
  }
  
  if (!isDecodedTradeEventData(raw.data)) {
    console.warn(
      'extractDecodedTradeEvent: data shape invalid',
      raw.data
    );
    return null;
  }
  
  return raw.data;
}
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.
 */
export function extractDecodedTradeEventErrorGuard(
  raw: unknown
):{success:BoolLike,data: DecodedTradeEvents | null | DataLike}{
  if (!isTradeEvent(raw)) {
    return {success:null,data:null};
  }
  let success = true
  let data = raw.data
  if (data.decodable == false){
    success=false
  }
  return {success,data}
}
/**
 * Calculate price from decoded trade event.
 */
export function priceFromDecodedEvent(decoded: DecodedTradeEvents): PrecisePrice {
  return calculatePrecisePrice(decoded.sol_amount, decoded.token_amount);
}
// =============================================================================
// LAYER 2 → LAYER 3: Enrich
// =============================================================================



/**
 * Enrich decoded trade event with computed values and context.
 * Pure function - no side effects.
 */
export function enrichTradeEvent(
  decoded: DecodedTradeEvents,
  ctx: TransactionEnrichmentContext
): EnrichedTrade {
  const price = calculatePrecisePrice(decoded.sol_amount, decoded.token_amount);
  
  return {
    ...decoded,
    ...ctx,
    decoded,
    price,
    sol_amount_ui: lamportsToSol(decoded.sol_amount),
    token_amount_ui: toUiAmount(decoded.token_amount, 6), // pump.fun tokens are 6 decimals
  };
}

// =============================================================================
// LAYER 3 → DB: To Insert Params
// =============================================================================

/**
 * Convert enriched trade to DB-ready insert params.
 * All bigints → strings for NUMERIC columns.
 */
export function toInsertParams(enriched: EnrichedTrade): TransactionsInsertDTO {
  const { decoded } = enriched;
  return {
    log_id: enriched.log_id,
    pair_id: enriched.pair_id,
    meta_id: enriched.meta_id,
    signature: enriched.signature,
    program_id: enriched.program_id,
    slot: enriched.slot,
    invocation: enriched.invocation,
    mint: decoded.mint,
    user_address: decoded.user_address,
    is_buy: decoded.is_buy,
    ix_name: decoded.ix_name,
    sol_amount: decoded.sol_amount,
    token_amount: decoded.token_amount,
    virtual_sol_reserves: decoded.virtual_sol_reserves,
    virtual_token_reserves: decoded.virtual_token_reserves,
    real_sol_reserves: decoded.real_sol_reserves,
    real_token_reserves: decoded.real_token_reserves,
    mayhem_mode: decoded.mayhem_mode,
    price: enriched.price.float,
    track_volume: decoded.track_volume,
    total_unclaimed_tokens: decoded.total_unclaimed_tokens,
    total_claimed_tokens: decoded.total_claimed_tokens,
    current_sol_volume: decoded.current_sol_volume,
    fee_recipient: decoded.fee_recipient,
    fee_basis_points: decoded.fee_basis_points,
    fee: decoded.fee,
    creator: decoded.creator,
    creator_fee_basis_points: decoded.creator_fee_basis_points,
    creator_fee: decoded.creator_fee,
    timestamp: decoded.timestamp,
    last_update_timestamp: decoded.last_update_timestamp,
  };
}
export function toTransactionInsertParams(
  enriched: EnrichedTrade
): TransactionsInsertParams {
  const d = enriched.decoded;
  return new TransactionsInsertParams(
    enriched.log_id,
    enriched.pair_id,
    enriched.meta_id,
    enriched.signature,
    enriched.program_id,
    enriched.slot,
    enriched.invocation || enriched.invocation_index,
    d.mint,
    d.user_address,
    d.is_buy,
    d.ix_name,
    d.sol_amount,
    d.token_amount,
    d.virtual_sol_reserves,
    d.virtual_token_reserves,
    d.real_sol_reserves,
    d.real_token_reserves,
    d.mayhem_mode  || enriched.mayhem_mode|| false,
    enriched.price.float,
    d.track_volume || enriched.track_volume|| false,
    d.total_unclaimed_tokens || enriched.total_unclaimed_tokens,
    d.total_claimed_tokens || enriched.total_claimed_tokens,
    d.current_sol_volume || enriched.current_sol_volume,
    d.fee_recipient || enriched.fee_recipient,
    d.fee_basis_points || enriched.fee_basis_points,
    d.fee || enriched.fee,
    d.creator,
    d.creator_fee_basis_points || enriched.creator_fee_basis_points,
    d.creator_fee || enriched.creator_fee,
    d.timestamp,
    d.last_update_timestamp
  );
}
// =============================================================================
// FULL PIPELINE
// =============================================================================

/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid TradeEvent.
 * Throws if DB validation fails (indicates bug in pipeline).
 */


  /**
   * Full pipeline: raw decode output → validated insert params.
   * Returns null if decode output is not a valid CreateEvent.
   */
export function preProcessTradeEvent(
  raw: unknown,
  ctx: TransactionEnrichmentContext
): TradePipelineResult | null {
  // Layer 1: Extract
  const decoded = extractDecodedTradeEvent(raw);
  if (!decoded) {
    return null;
  }
  if (!ctx.program_id) {
  throw new Error(`Missing program_id in TradePipelineContext`);
}
  // Layer 2: Enrich
  const enriched = enrichTradeEvent(decoded, ctx);

  // Layer 3: To DB params
  const insertParams = toInsertParams(enriched);
  
  // Gate check (should never fail if pipeline is correct)
  if (!isDbSafeInsertTransactionsParams(insertParams)) {
    throw new Error(
      `processTradeEvent: insertParams failed DB validation. ` +
      `signature=${ctx.signature}. This indicates a bug in the pipeline.`
    );
  }
  return { decoded, enriched, insertParams , result:{}};
}
  /**
   * Full pipeline: raw decode output → validated insert params.
   * Returns null if decode output is not a valid CreateEvent.
   */
export function processTradeEventErrorGuard(
  decoded: DecodedTradeEvents,
  ctx: TransactionEnrichmentContext
): TradePipelineResult {
  if (!ctx.program_id) {
    throw new Error(`Missing program_id in TradePipelineContext`);
  }
  // Coerce the event itself, not just .raw — after JSON round-trip
  // through RabbitMQ, all bigint fields arrive as strings
  const safe = coerceTradeEventBigints(decoded as unknown as Record<string, unknown>) as unknown as DecodedTradeEvents;
  const tradeEvent: TradePipelineResult | null = preProcessTradeEvent(safe, ctx);
  if (!tradeEvent) {
    let out: { decoded?: DecodedTradeEvents; enriched?: EnrichedTrade; insertParams?: TransactionsInsertParams,result?:any } = {};
    out.decoded = safe;
    out.enriched = enrichTradeEvent(safe, ctx);   // ← safe, not decoded
    out.insertParams = toTransactionInsertParams(out.enriched);
    out.result={}
    return out as TradePipelineResult;
  }
  return tradeEvent as TradePipelineResult;
}