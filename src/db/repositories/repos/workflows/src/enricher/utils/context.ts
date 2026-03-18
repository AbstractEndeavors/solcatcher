// src/pipeline/orchestrator/enrichment/context.ts

import { 
  type PairEnrichmentRow, 
  type MetaDataEnrichmentRow,
  type EnrichParams,
  type FetchPairDataEnrich,
  type FetchMetaDataEnrich,
  type CreateContextEnrich,
  expectSingleRow,
  getIdOrNull,
  SOLANA_PUMP_FUN_PROGRAM_ID,
  type EnrichmentContext
} from "@imports";
import {getRepoServices} from '@repoServices';
export async function fetchPairDataEnrichmentRow(
  params: FetchPairDataEnrich
): Promise<PairEnrichmentRow> {
  let { pair_id, mint, program_id } = params;
  const {pairsRepo} = await getRepoServices.repos();
  // Derive identifiers if missing
  let pair: PairEnrichmentRow | null = null;
  if (pair == null && pair_id) {
    pair = await pairsRepository.fetchById(pair_id) as PairEnrichmentRow;
  }
  if (pair == null && mint) {
    pair = await pairsRepository.fetchByMint(mint) as PairEnrichmentRow;
  }
  if (pair == null){
      pair_id = await pairsRepository.insertIdentity({mint,program_id})
      pair = await pairsRepository.fetchById(pair_id) as PairEnrichmentRow;
  }
  return expectSingleRow(pair)
}
export async function getPairDataEnrichmentRow(
  params:EnrichParams
):Promise<PairEnrichmentRow>{
  let {pair} = params;
  if (!pair){
    pair= await fetchPairDataEnrichmentRow(params)
  }
  return pair as PairEnrichmentRow
}
export async function fetchMetaDataEnrichmentRow(
  params: FetchMetaDataEnrich
): Promise<MetaDataEnrichmentRow> {
  let { pair, meta_id, mint, program_id } = params;
  const { metaDataRepository } = await getRepoServices.repos();
  // Derive identifiers if missing
  if (meta_id == null && mint == null) {
    pair = pair || await getPairDataEnrichmentRow(params);
    meta_id = pair.meta_id;
    mint = pair.mint;
    program_id = program_id ?? pair.program_id;
  }
  let meta: MetaDataEnrichmentRow | null = null;
  if (meta == null && meta_id) {
    meta = await metaDataRepository.fetchById(meta_id) as MetaDataEnrichmentRow;
  }
  if (meta == null && mint) {
    meta = await metaDataRepository.fetchByMint(mint) as MetaDataEnrichmentRow;
  }
  if (meta == null){
    meta_id = await metaDataRepository.insertStub(mint,program_id)
    meta = await metaDataRepository.fetchById(meta_id) as MetaDataEnrichmentRow;
  }
  return expectSingleRow(meta)
}
export async function getMetaDataEnrichmentRow(
  params:EnrichParams
):Promise<MetaDataEnrichmentRow>{
  let {meta} = params;
  if (!meta){
    meta= await fetchMetaDataEnrichmentRow(params)
  }
  return meta
}
/** Factory to create context - fetch once, use many */
export async function createEnrichmentContext(
  params: CreateContextEnrich
): Promise<EnrichmentContext> {
  let pair = await getPairDataEnrichmentRow(params)
  let meta = await getMetaDataEnrichmentRow(params)
  const pair_id= params.pair_id || getIdOrNull(pair)
  const meta_id= params.meta_id || getIdOrNull(meta) || pair.meta_id
  const mint= params.mint || pair.mint || meta.mint
  const program_id= params.program_id || pair.program_id || meta.program_id || SOLANA_PUMP_FUN_PROGRAM_ID
  const enrich_fields= params.enrich_fields || {pair:[],meta:[]}
  const out= {
    pair_id,
    meta_id,
    mint,
    program_id,
    pair,
    meta,
    enrich_fields
  };
  return out
}

/** Factory to create context - fetch once, use many */
export async function fetchEnrichmentContext(
  params: CreateContextEnrich
): Promise<EnrichmentContext> {
  let pair = await fetchPairDataEnrichmentRow(params)
  let meta = await fetchMetaDataEnrichmentRow(params)
  const pair_id= params.pair_id || getIdOrNull(pair)
  const meta_id= params.meta_id || getIdOrNull(meta) || pair.meta_id
  const mint= params.mint || pair.mint || meta.mint
  const program_id= params.program_id || pair.program_id || meta.program_id || SOLANA_PUMP_FUN_PROGRAM_ID
  const enrich_fields= params.enrich_fields || {pair:[],meta:[]}
  const out= {
    pair_id,
    meta_id,
    mint,
    program_id,
    pair,
    meta,
    enrich_fields
  };
  return out
}