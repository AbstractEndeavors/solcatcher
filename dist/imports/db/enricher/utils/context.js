// src/pipeline/orchestrator/enrichment/context.ts
import { expectSingleRow, getIdOrNull, SOLANA_PUMP_FUN_PROGRAM_ID } from "@imports";
import { getRepoServices } from '@repoServices';
export async function fetchPairDataEnrichmentRow(params) {
    let { pair_id, mint, program_id } = params;
    const { pairsRepo } = await getRepoServices.repos();
    // Derive identifiers if missing
    let pair = null;
    if (pair == null && pair_id) {
        pair = await pairsRepo.fetchById(pair_id);
    }
    if (pair == null && mint) {
        pair = await pairsRepo.fetchByMint(mint);
    }
    if (pair == null) {
        pair_id = await pairsRepo.insertIdentity({ mint, program_id });
        pair = await pairsRepo.fetchById(pair_id);
    }
    return expectSingleRow(pair);
}
export async function getPairDataEnrichmentRow(params) {
    let { pair } = params;
    if (!pair) {
        pair = await fetchPairDataEnrichmentRow(params);
    }
    return pair;
}
export async function fetchMetaDataEnrichmentRow(params) {
    let { pair, meta_id, mint, program_id } = params;
    const { metaDataRepo } = await getRepoServices.repos();
    // Derive identifiers if missing
    if (meta_id == null && mint == null) {
        pair = pair || await getPairDataEnrichmentRow(params);
        meta_id = pair.meta_id;
        mint = pair.mint;
        program_id = program_id ?? pair.program_id;
    }
    let meta = null;
    if (meta == null && meta_id) {
        meta = await metaDataRepo.fetchById(meta_id);
    }
    if (meta == null && mint) {
        meta = await metaDataRepo.fetchByMint(mint);
    }
    if (meta == null) {
        meta_id = await metaDataRepo.insertStub(mint, program_id);
        meta = await metaDataRepo.fetchById(meta_id);
    }
    return expectSingleRow(meta);
}
export async function getMetaDataEnrichmentRow(params) {
    let { meta } = params;
    if (!meta) {
        meta = await fetchMetaDataEnrichmentRow(params);
    }
    return meta;
}
/** Factory to create context - fetch once, use many */
export async function createEnrichmentContext(params) {
    let pair = await getPairDataEnrichmentRow(params);
    let meta = await getMetaDataEnrichmentRow(params);
    const pair_id = params.pair_id || getIdOrNull(pair);
    const meta_id = params.meta_id || getIdOrNull(meta) || pair.meta_id;
    const mint = params.mint || pair.mint || meta.mint;
    const program_id = params.program_id || pair.program_id || meta.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    const enrich_fields = params.enrich_fields || { pair: [], meta: [] };
    const out = {
        pair_id,
        meta_id,
        mint,
        program_id,
        pair,
        meta,
        enrich_fields
    };
    return out;
}
/** Factory to create context - fetch once, use many */
export async function fetchEnrichmentContext(params) {
    let pair = await fetchPairDataEnrichmentRow(params);
    let meta = await fetchMetaDataEnrichmentRow(params);
    const pair_id = params.pair_id || getIdOrNull(pair);
    const meta_id = params.meta_id || getIdOrNull(meta) || pair.meta_id;
    const mint = params.mint || pair.mint || meta.mint;
    const program_id = params.program_id || pair.program_id || meta.program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    const enrich_fields = params.enrich_fields || { pair: [], meta: [] };
    const out = {
        pair_id,
        meta_id,
        mint,
        program_id,
        pair,
        meta,
        enrich_fields
    };
    return out;
}
