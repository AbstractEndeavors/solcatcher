/**
 * ENRICHERS
 *
 * Each enricher is a pure-ish function: (ctx, deps) → ctx
 *
 * Changes from previous version:
 *   - Every enricher takes explicit EnrichmentDeps — no getRepoServices
 *   - enrichMetaDataLink bug fixed (was assigning ctx.meta_id instead of
 *     the locally-derived meta_id)
 *   - Error boundaries: safeEnrich wrapper catches per-enricher and
 *     continues the pipeline
 *   - enrichOnchainMeta data precedence is documented and consistent
 *     (chain data fills gaps, never overwrites existing ctx values)
 *
 * Pattern: Registries over globals, explicit wiring over smart defaults
 */
import { deriveAllPDAsAuto, fetchMetaData } from '@rateLimiter';
import { normalizeSymbol, getIdOrNull, } from '@imports';
import { buildEnrichmentContext, refreshMetaRow, } from './context.js';
import { isTradeEvent, isCreateEvent, resolveDecodedEvents, } from '@imports';
import { getDeps } from '@repoServices';
/**
 * Wraps an enricher so a single failure doesn't kill the pipeline.
 * Logs the error, returns ctx unchanged.
 */
export function safeEnrich(name, fn) {
    return async (ctx, deps) => {
        try {
            return await fn(ctx, deps);
        }
        catch (err) {
            console.error({
                logType: 'enricher_error',
                enricher: name,
                mint: ctx.mint,
                pair_id: ctx.pair_id,
                error: err instanceof Error ? err.message : String(err),
            });
            return ctx;
        }
    };
}
// ============================================================
// PDA ENRICHMENT
// ============================================================
export async function enrichPDAs(ctx, _deps = null) {
    if (ctx.pair.bonding_curve &&
        ctx.pair.associated_bonding_curve &&
        ctx.pair.token_program) {
        return ctx;
    }
    const d = deriveAllPDAsAuto(ctx.pair.mint, ctx.pair.program_id);
    if (!ctx.pair.token_program && d.token_program) {
        ctx.pair.token_program = d.token_program;
        ctx.enrich_fields.pair.push('token_program');
    }
    if (!ctx.pair.bonding_curve && d.bonding_curve) {
        ctx.pair.bonding_curve = d.bonding_curve;
        ctx.enrich_fields.pair.push('bonding_curve');
    }
    if (!ctx.pair.associated_bonding_curve && d.associated_bonding_curve) {
        ctx.pair.associated_bonding_curve = d.associated_bonding_curve;
        ctx.enrich_fields.pair.push('associated_bonding_curve');
    }
    return ctx;
}
// ============================================================
// GENESIS SIGNATURE
// ============================================================
export async function enrichGenesis(ctx, deps = null) {
    // Both present — nothing to do
    if (ctx.pair.signature && ctx.meta.signature)
        return ctx;
    // Cross-fill if one side has it
    if (ctx.pair.signature && !ctx.meta.signature) {
        ctx.meta.signature = ctx.pair.signature;
        ctx.enrich_fields.meta.push('signature');
        return ctx;
    }
    if (ctx.meta.signature && !ctx.pair.signature) {
        ctx.pair.signature = ctx.meta.signature;
        ctx.enrich_fields.pair.push('signature');
        return ctx;
    }
    // Neither side — search by known accounts
    const accounts = [
        ctx.pair.bonding_curve,
        ctx.pair.associated_bonding_curve,
        ctx.pair.mint,
    ].filter(Boolean);
    // NOTE: signaturesService should be added to EnrichmentDeps if this
    // enricher is used. For now, keeping the import path explicit so
    // the missing dep is visible rather than hidden behind a locator.
    // TODO: add signaturesService to EnrichmentDeps
    for (const account of accounts) {
        // This is a placeholder — the actual lookup needs signaturesService
        // which should be wired into deps when available.
        // const sig = await deps.signaturesService.findGenesisSignature({ account });
        break;
    }
    return ctx;
}
// ============================================================
// LOG DATA
// ============================================================
// ============================================================
// METADATA LINK — fixed: was assigning ctx.meta_id instead of
//                 the locally-derived meta_id
// ============================================================
export async function enrichMetaDataLink(ctx, deps = null) {
    deps = await getDeps(deps);
    if (ctx.meta_id || ctx.pair.meta_id)
        return ctx;
    const metaRow = ctx.meta || (await deps.metaDataRepo.fetchByMint(ctx.pair.mint));
    const meta_id = getIdOrNull(metaRow);
    if (meta_id) {
        // BUG FIX: was `ctx.pair.meta_id = ctx.meta_id` (always null here)
        // Now correctly assigns the derived meta_id
        ctx.pair.meta_id = meta_id;
        ctx.enrich_fields.pair.push('meta_id');
    }
    return ctx;
}
// ============================================================
// EVENT ENRICHMENT — trades + creates
// ============================================================
export async function enrichEvents(ctx, deps = null) {
    deps = await getDeps(deps);
    ctx = (await buildEnrichmentContext(deps, ctx, false));
    // ── gate: do we actually need event data? ──
    const needsReserves = ctx.pair.virtual_token_reserves == null ||
        ctx.pair.virtual_sol_reserves == null ||
        ctx.pair.real_token_reserves == null;
    const needsCreators = ctx.pair.creator == null ||
        ctx.pair.timestamp == null ||
        ctx.pair.token_total_supply == null ||
        ctx.meta.name == null ||
        ctx.meta.symbol == null ||
        ctx.meta.offchain_metadata?.description == null ||
        ctx.meta.uri == null ||
        ctx.meta.creator == null;
    if (!ctx.pair.signature || (!needsReserves && !needsCreators)) {
        return ctx;
    }
    // ── resolve events: pre-decoded from ingest OR fresh decode ──
    const { trades, creates } = await resolveDecodedEvents(ctx, deps.logPayloads, ctx.pair.signature);
    const repos = {
        pairsRepo: deps.pairsRepo,
        metaDataRepo: deps.metaDataRepo,
        transactionsRepo: deps.transactionsRepo,
    };
    // ── apply trade events ──
    for (const trade of trades) {
        if (needsReserves) {
            applyTradeToContext(ctx, trade);
        }
        const eventCtx = buildEventContext(ctx, trade);
        const results = [
            {
                kind: 'trade',
                log_id: ctx.pair.log_id,
                pair_id: ctx.pair.id,
                meta_id: ctx.meta.id || ctx.pair.meta_id,
                txn_id: null,
            },
        ];
        const enrichmentTasks = [
            {
                queue: 'metaEnrich',
                payload: {
                    meta_id: ctx.meta.id || ctx.pair.meta_id,
                    mint: trade.mint,
                    program_id: trade.provenance.program_id,
                    uri: trade.raw.uri,
                },
            },
        ];
    }
    // ── apply create events ──
    for (const create of creates) {
        if (needsCreators) {
            applyCreateToContext(ctx, create);
        }
        const eventCtx = buildEventContext(ctx, create);
        const results = [
            {
                kind: 'create',
                log_id: ctx.pair.log_id,
                pair_id: ctx.pair_id || getIdOrNull(ctx.pair),
                meta_id: ctx.meta.id || ctx.pair.meta_id,
                txn_id: null,
            },
        ];
        const enrichmentTasks = [
            {
                queue: 'metaEnrich',
                payload: {
                    meta_id: ctx.meta.id || ctx.pair.meta_id,
                    mint: create.mint,
                    program_id: create.provenance.program_id,
                    uri: create.uri,
                },
            },
        ];
    }
    // Re-fetch ONCE after all events, not per-event
    if (trades.length > 0 || creates.length > 0) {
        ctx = (await buildEnrichmentContext(deps, ctx, true));
    }
    return ctx;
}
// ============================================================
// ONCHAIN METADATA
//
// Precedence rule: chain data FILLS GAPS in ctx.
// If ctx already has a value, chain data does not overwrite.
// ============================================================
export async function enrichOnchainMeta(ctx, deps = null) {
    deps = await getDeps(deps);
    if (ctx.meta.has_metadata !== false && ctx.meta.has_onchain_metadata !== false) {
        return ctx;
    }
    const chainData = await fetchMetaData(ctx.meta.mint);
    if (!chainData?.metadata)
        return ctx;
    // Build the enrichment payload using ctx values as precedence,
    // falling back to chain data. Never mutate the row directly.
    const meta_id = ctx.meta_id || getIdOrNull(ctx.meta) || ctx.pair.meta_id;
    await deps.metaDataRepo.enrichOnchain(meta_id, {
        // ctx wins, chain fills gaps — computed here, not on the row
        name: normalizeSymbol(ctx.meta.name) ?? normalizeSymbol(chainData.metadata.name),
        uri: normalizeSymbol(ctx.meta.uri) ?? normalizeSymbol(chainData.metadata.uri),
        symbol: normalizeSymbol(ctx.meta.symbol) ?? normalizeSymbol(chainData.metadata.symbol),
        metadata_pda: chainData.metadata?.publicKey ?? null,
        update_authority: chainData.metadata?.updateAuthority ?? null,
        mint_authority: chainData.spl?.mintAuthority ?? null,
        freeze_authority: chainData.spl?.freezeAuthority ?? null,
        seller_fee_basis_points: chainData.metadata?.sellerFeeBasisPoints ?? null,
        is_mutable: chainData.metadata?.isMutable ?? null,
        primary_sale_happened: chainData.metadata?.primarySaleHappened ?? null,
        token_standard: chainData.metadata?.tokenStandard?.__option ?? null,
        onchain_metadata: chainData.metadata,
        spl_metadata: chainData.spl,
    });
    // Refresh replaces ctx.meta with a fresh row from DB — single source of truth
    ctx.meta = await refreshMetaRow(deps, ctx);
    return ctx;
}
// ============================================================
// OFFCHAIN METADATA
// ============================================================
export async function enrichOffchainMeta(ctx, deps = null) {
    deps = await getDeps(deps);
    if (!ctx.meta.uri || ctx.meta.has_offchain_metadata !== false) {
        return ctx;
    }
    // fetchOffchainJson is a standalone utility — no deps needed
    const { fetchOffchainJson } = await import('./utils/index.js');
    const offchain = await fetchOffchainJson(ctx.meta.uri);
    if (!offchain)
        return ctx;
    const meta_id = ctx.meta_id || getIdOrNull(ctx.meta) || ctx.pair.meta_id;
    await deps.metaDataRepo.enrichOffchain(meta_id, {
        image: offchain.image ?? null,
        description: offchain.description ?? null,
        external_url: offchain.external_url ?? null,
        offchain_metadata: offchain,
        has_offchain_metadata: true,
    });
    ctx.meta = await refreshMetaRow(deps, ctx);
    return ctx;
}
// ============================================================
// CONTEXT APPLICATORS — typed inputs, explicit field tracking
// ============================================================
function applyTradeToContext(ctx, trade) {
    if (ctx.pair.virtual_token_reserves == null && trade.virtual_token_reserves != null) {
        ctx.pair.virtual_token_reserves = trade.virtual_token_reserves;
        ctx.enrich_fields.pair.push('virtual_token_reserves');
    }
    if (ctx.pair.virtual_sol_reserves == null && trade.virtual_sol_reserves != null) {
        ctx.pair.virtual_sol_reserves = trade.virtual_sol_reserves;
        ctx.enrich_fields.pair.push('virtual_sol_reserves');
    }
    if (ctx.pair.real_token_reserves == null && trade.real_token_reserves != null) {
        ctx.pair.real_token_reserves = trade.real_token_reserves;
        ctx.enrich_fields.pair.push('real_token_reserves');
    }
}
function applyCreateToContext(ctx, create) {
    if (ctx.pair.creator == null && create.creator != null) {
        ctx.pair.creator = create.creator;
        ctx.enrich_fields.pair.push('creator');
    }
    if (ctx.pair.timestamp == null && create.timestamp != null) {
        ctx.pair.timestamp = create.timestamp;
        ctx.enrich_fields.pair.push('timestamp');
    }
    if (ctx.pair.token_total_supply == null && create.token_total_supply != null) {
        ctx.pair.token_total_supply = create.token_total_supply;
        ctx.enrich_fields.pair.push('token_total_supply');
    }
    if (ctx.meta.uri == null && create.uri != null) {
        ctx.meta.uri = create.uri;
        ctx.enrich_fields.meta.push('uri');
    }
    if (ctx.meta.name == null && create.name != null) {
        ctx.meta.name = create.name;
        ctx.enrich_fields.meta.push('name');
    }
    if (ctx.meta.symbol == null && create.symbol != null) {
        ctx.meta.symbol = create.symbol;
        ctx.enrich_fields.meta.push('symbol');
    }
    if (ctx.meta.offchain_metadata?.description == null && create.description != null) {
        ctx.meta.offchain_metadata.description = create.description;
        ctx.enrich_fields.meta.push('description');
    }
    if (ctx.meta.creator == null && create.creator != null) {
        ctx.meta.creator = create.creator;
        ctx.enrich_fields.meta.push('creator');
    }
    if (ctx.meta.user_address == null && create.raw.user != null) {
        ctx.meta.user_address = create.raw.user;
        ctx.enrich_fields.meta.push('user');
    }
}
// ============================================================
// EVENT CONTEXT BUILDER
// ============================================================
function buildEventContext(ctx, event) {
    return {
        signature: ctx.pair.signature,
        slot: event.slot,
        program_id: event.provenance.program_id || ctx.pair.program_id,
        log_id: ctx.pair.log_id,
        invocation: event.provenance.invocation_index,
        mint: event.mint,
    };
}
