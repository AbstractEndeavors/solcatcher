/**
 * CLASSIFIER
 *
 * Pure function: raw decoded registry output → ClassifiedEvent.
 * No DB access. No side effects. No orchestration.
 *
 * This is the single place where "is this a trade or a create?" lives.
 * The enricher, the orchestrator, the decode workflow — none of them
 * do this check anymore. They call classify().
 *
 * Pattern: Registries over globals (the decode registry is injected)
 */
import type {

  DecodedCreateEvents,
  DecodedUnknownEvent,
  DecodeProvenance,
  LogPayloadRow 
} from './imports.js';
import {
  normalizeBigInt,

  extractDecodedTradeEventErrorGuard,
  extractDecodedCreateEventErrorGuard,
  isDecodedResult,
} from './imports.js';
import {  type ClassifiedEvent,
  type DecodedTradeEvents,EventKind} from '@imports'
// ============================================================
// CLASSIFY — single payload → single ClassifiedEvent | null
// ============================================================

/**
 * Takes a LogPayloadRow + the decode registry, returns a ClassifiedEvent.
 *
 * Returns null only when the payload is not decodable at all
 * (missing b64, decodable===false, registry returns garbage).
 *
 * For payloads that decode but match no known event shape,
 * returns DecodedUnknownEvent — the consumer decides what to do.
 */
export function classifyPayload(
  row: LogPayloadRow,
  registry: { decode: (buf: Buffer) => unknown }
): ClassifiedEvent | null {
  // ── gate: skip undecodable rows ──
  if (row.decodable === false) return null;
  if (!row.b64 && row.b64) return null;

  // ── decode ──
  const buf = Buffer.from(row.b64, 'base64');
  const decoded = registry.decode(buf);
  if (!isDecodedResult(decoded)) return null;

  // ── provenance (shared by every branch) ──
  const provenance: DecodeProvenance = {
    payload_id: row.id,
    signature: row.signature,
    program_id: row.program_id,
    discriminator: row.discriminator,
    invocation_index: row.invocation_index,
    depth: row.depth,
  };

  const data = (decoded as any).data ?? decoded;

  // ── try trade ──
  const tradeCheck = extractDecodedTradeEventErrorGuard(decoded);
  if (tradeCheck.success) {
    return buildTradeEvent(provenance, tradeCheck.data);
  }

  // ── try create ──
  const createCheck = extractDecodedCreateEventErrorGuard(decoded);
  if (createCheck.success) {
    return buildCreateEvent(provenance, createCheck.data);
  }

  // ── decoded but unrecognized ──
  return buildUnknownEvent(provenance, row.discriminator, data);
}

// ============================================================
// CLASSIFY BATCH — convenience for multiple rows
// ============================================================

export function classifyPayloadBatch(
  rows: LogPayloadRow[],
  registry: { decode: (buf: Buffer) => unknown }
): { events: ClassifiedEvent[]; skipped: number } {
  const events: ClassifiedEvent[] = [];
  let skipped = 0;

  for (const row of rows) {
    const result = classifyPayload(row, registry);
    if (result) {
      events.push(result);
    } else {
      skipped++;
    }
  }

  return { events, skipped };
}

// ============================================================
// BUILDERS — pure construction, no logic leaks
// ============================================================

function buildTradeEvent(
  provenance: DecodeProvenance,
  data: Record<string, any>
): DecodedTradeEvents {
  return {
    kind: EventKind.TRADE,
    provenance,
    ...provenance,
    mint: data.mint,
    user_address: data.user ?? data.user_address,
    is_buy: data.is_buy ?? data.isBuy,
    ix_name: data.ix_name ?? data.ixName ?? 'unknown',

    sol_amount: normalizeBigInt(data.sol_amount ?? data.solAmount),
    token_amount: normalizeBigInt(data.token_amount ?? data.tokenAmount),

    virtual_sol_reserves: normalizeBigInt(data.virtual_sol_reserves ?? data.virtualSolReserves) ?? null,
    virtual_token_reserves: normalizeBigInt(data.virtual_token_reserves ?? data.virtualTokenReserves) ?? null,
    real_sol_reserves: normalizeBigInt(data.real_sol_reserves ?? data.realSolReserves) ?? null,
    real_token_reserves: normalizeBigInt(data.real_token_reserves ?? data.realTokenReserves) ?? null,

    slot: data.slot ?? null,
    timestamp: data.timestamp ?? null,

    invocation: provenance.invocation_index ?? null,
    mayhem_mode: data.mayhem_mode ?? null,
    
    // volume tracking
    track_volume: data.track_volume ?? null,
    total_unclaimed_tokens: data.total_unclaimed_tokens ?? null,
    total_claimed_tokens: data.total_claimed_tokens ?? null,
    current_sol_volume: data.current_sol_volume ?? null,
    
    // fees
    fee_recipient: data.fee_recipient ?? null,
    fee_basis_points: data.fee_basis_points ?? null,
    fee: data.fee ?? data.fee ?? null,
    
    // creator
    creator: data.creator ?? data.creator,
    creator_fee_basis_points: data.creator_fee_basis_points ?? null,
    creator_fee: data.creator_fee ?? null,
    last_update_timestamp: null,
    raw: data,
  };
}

function buildCreateEvent(
  provenance: DecodeProvenance,
  data: Record<string, any>
): DecodedCreateEvents {
  return {
    kind: EventKind.CREATE,
    provenance,
    mint: data.mint,
    creator: data.creator ?? data.user ?? null,
    name: data.name ?? null,
    symbol: data.symbol ?? null,
    uri: data.uri ?? null,
    description: data.description ?? null,
    token_total_supply: data.token_total_supply ?? data.tokenTotalSupply ?? null,
    slot: data.slot ?? null,
    timestamp: data.timestamp ?? null,
    bonding_curve: data.bonding_curve,
    token_program:  data.token_program,
    // actors
    user:  data.token_program,
    // genesis reserves (raw bigint from chain)
    virtual_token_reserves:   data.virtual_token_reserves ?? null,
    virtual_sol_reserves:   data.virtual_sol_reserves ?? null,
    real_token_reserves:   data.real_token_reserves ?? null,
    // flags
    is_mayhem_mode:  data.is_mayhem_mode ?? null,
    raw: data,
  };
}

function buildUnknownEvent(
  provenance: DecodeProvenance,
  discriminator: string,
  raw: Record<string, unknown>
): DecodedUnknownEvent {
  return {
    kind: EventKind.UNKNOWN,
    provenance,
    discriminator,
    raw,
  };
}
