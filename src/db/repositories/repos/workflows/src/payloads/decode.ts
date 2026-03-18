/**
 * decodePayloads — UPDATED
 *
 * This is now a thin router. It receives IngestResult (or LogPayloadContext),
 * checks for pre-decoded events, and routes them to pair/meta/txn services.
 *
 * If called with a plain LogPayloadContext (no decoded events),
 * it falls back to service.decodePartitioned().
 *
 * In the common case (called right after ingest), this does zero decoding.
 */

import { LogOrchestrator } from './../../LogOrchestrator.js';
import type {
  LogPayloadContext,
  TransactionEnrichmentContext,
  CreateEnrichmentContext,
  MintLike,
  IdLike,
} from '@imports';
import {
  getIdOrNull,
  processTradeEventErrorGuard,
  processCreateEventErrorGuard,

} from '@imports';
import {
  type IngestResult,
  type PartitionedEvents,
  hasDecodedEvents,
  partitionEvents,
  type DecodedTradeEvents,
  type DecodedCreateEvents,
}  from '@imports';

// ============================================================
// MAIN ENTRY — accepts IngestResult or plain LogPayloadContext
// ============================================================

export async function decodePayloads(
  this: LogOrchestrator,
  event: LogPayloadContext | IngestResult
): Promise<void> {
  const signature = event.signature;

  // ── resolve events: pre-decoded or fresh decode ──
  let decoded: PartitionedEvents;

  if (hasDecodedEvents(event)) {
    decoded = event.decoded;
  } else {
    const result = await this.cfg.logPayloadService.decodePartitioned(signature);
    decoded = { trades: result.trades, creates: result.creates, unknowns: result.unknowns };
  }

  // ── route trades ──
  for (const trade of decoded.trades) {
    await routeTradeEvent.call(this, trade, event);
  }

  // ── route creates ──
  for (const create of decoded.creates) {
    await routeCreateEvent.call(this, create, event);
  }
}

// ============================================================
// TRADE ROUTER
// ============================================================

async function routeTradeEvent(
  this: LogOrchestrator,
  trade: DecodedTradeEvents,
  event: LogPayloadContext
): Promise<void> {
  const log_id = event.log_id;
  const mint: MintLike = trade.mint;
  const program_id = event.program_id;

  // Resolve pair
  let pair = await this.cfg.pairsService.fetch({ mint });
  let pair_id: IdLike;

  if (!pair) {
    pair_id = (await this.cfg.pairsService.insertIdentity({
      mint,
      program_id,
    })) as IdLike;
    pair = await this.cfg.pairsService.fetchById(pair_id);
  }

  pair_id = pair_id || getIdOrNull(pair);

  // Resolve metadata
  const meta_id = await this.cfg.metaDataService.getIdByMint(mint);

  const ctx: TransactionEnrichmentContext = {
    signature: event.signature,
    slot: event.slot,
    program_id,
    invocation: trade.provenance.invocation_index,
    log_id,
    pair_id,
    meta_id,
  };

  const result = processTradeEventErrorGuard(trade, ctx);
  if (result) {
    await this.cfg.transactionsService.insertTransactions(result.insertParams);
  }
}

// ============================================================
// CREATE ROUTER
// ============================================================

async function routeCreateEvent(
  this: LogOrchestrator,
  create: DecodedCreateEvents,
  event: LogPayloadContext
): Promise<void> {
  const ctx: CreateEnrichmentContext = {
    signature: event.signature,
    slot: event.slot,
    program_id: event.program_id,
    invocation: create.provenance.invocation_index,
    log_id: event.log_id,
  };

  const result = processCreateEventErrorGuard(create, ctx);
  if (result) {
    const meta_id = await this.cfg.metaDataService.insertFromCreateEvent(
      result.enriched.metadata
    );
    await this.cfg.pairsService.insert({
      meta_id,
      ...result.insertParams,
    });
  }
}
