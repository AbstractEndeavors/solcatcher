import { DecoderRegistry } from './../../decoding/index.js';
import { EventKind } from './trade/index.js';
// ============================================================
// TYPE GUARDS (narrowing without casting)
// ============================================================
export function isTradeEvent(e) {
    return e.kind === EventKind.TRADE;
}
// =============================================================================
// FULL PIPELINE
// =============================================================================
/**
 * Extract and validate DecodedTradeEvent from raw decoder output.
 * Returns null if not a valid TradeEvent.

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
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid TradeEvent.
 * Throws if DB validation fails (indicates bug in pipeline).
 */
/**
 * Full pipeline: raw decode output → validated insert params.
 * Returns null if decode output is not a valid CreateEvent.

export function processTradeEvent(
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
return { decoded, enriched, insertParams };
}
export function isCreateEvent(e: ClassifiedEvent): e is DecodedCreateEvents {
return e.kind === EventKind.CREATE;
}*/
export function isUnknownEvent(e) {
    return e.kind === EventKind.UNKNOWN;
}
export function partitionEvents(events) {
    const trades = [];
    const creates = [];
    const unknowns = [];
    for (const e of events) {
        switch (e.kind) {
            case EventKind.TRADE:
                trades.push(e);
                break;
            case EventKind.CREATE:
                creates.push(e);
                break;
            case EventKind.UNKNOWN:
                unknowns.push(e);
                break;
        }
    }
    return { trades, creates, unknowns };
}
