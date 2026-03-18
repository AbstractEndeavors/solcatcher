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
import { LogOrchestrator } from './../LogOrchestrator.js';
import { getIdOrNull, processTradeEventErrorGuard, processCreateEventErrorGuard, } from '@imports';
import { hasDecodedEvents, partitionEvents, } from '@imports';
// ============================================================
// MAIN ENTRY — accepts IngestResult or plain LogPayloadContext
// ============================================================
export async function decodePayloads(event) {
    const signature = event.signature;
    // ── resolve events: pre-decoded or fresh decode ──
    let decoded;
    if (hasDecodedEvents(event)) {
        decoded = event.decoded;
    }
    else {
        const result = await this.cfg.logPayloads.decodePartitioned(signature);
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
async function routeTradeEvent(trade, event) {
    const log_id = event.log_id;
    const mint = trade.mint;
    const program_id = event.program_id;
    // Resolve pair
    let pair = await this.cfg.Pairs.fetch({ mint });
    let pair_id;
    if (!pair) {
        pair_id = (await this.cfg.Pairs.insertIdentity({
            mint,
            program_id,
        }));
        pair = await this.cfg.Pairs.fetchById(pair_id);
    }
    pair_id = pair_id || getIdOrNull(pair);
    // Resolve metadata
    const meta_id = await this.cfg.MetaData.getIdByMint(mint);
    const ctx = {
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
        await this.cfg.Transactions.insertTransactions(result.insertParams);
    }
}
// ============================================================
// CREATE ROUTER
// ============================================================
async function routeCreateEvent(create, event) {
    const ctx = {
        signature: event.signature,
        slot: event.slot,
        program_id: event.program_id,
        invocation: create.provenance.invocation_index,
        log_id: event.log_id,
    };
    const result = processCreateEventErrorGuard(create, ctx);
    if (result) {
        const meta_id = await this.cfg.MetaData.insertFromCreateEvent(result.enriched.metadata);
        await this.cfg.Pairs.insert({
            meta_id,
            ...result.insertParams,
        });
    }
}
