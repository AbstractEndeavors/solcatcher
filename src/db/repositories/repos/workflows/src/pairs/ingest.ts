import {LogOrchestrator} from './../../LogOrchestrator.js';
import type {PairRow,PairsIngestResult,PairsIngestParams,IdLike,MintLike} from '@imports';
import {getIdOrNull,needsVolumeRefresh} from '@imports';
export async function getPairData(
  this:LogOrchestrator,
  params: PairsIngestParams
): Promise<PairRow | null> {
  const { pair, id, pair_id, mint } = params;

  // If pair provided, return it
  if (pair) {
    return pair;
  }

  // Otherwise fetch from repository
  return await this.cfg.pairsService.fetch({
    id: id || pair_id,
    mint
  });
}
/**
 * Main orchestrator - composes all sections
 */
export async function ingest(
  this:LogOrchestrator,
  params: PairsIngestParams
): Promise<PairsIngestResult> {
  // 1. Get pair data
  let pair = await this.getPairData(params);
  let pair_id:IdLike = getIdOrNull(pair)
  if (!pair) {
    throw new Error(`Pair not found: ${JSON.stringify(params)}`);
  }

  const enrichedFields: string[] = [];

  // 2. Check if volume refresh needed
  const needsRefresh = await needsVolumeRefresh(pair);

  if (needsRefresh) {
    const volumeResult = await this.refreshPairVolume(pair);
    if (volumeResult){
      enrichedFields.push(...volumeResult[0]);
    }
    // Refetch to get updated data
    pair = await this.cfg.pairsService.fetch({ id: pair_id });
  }

  // 3. Extract log payloads if needed
  if (pair){
    const payloadResult = await this.extractPairPayloads(pair);
    enrichedFields.push(payloadResult);
  }
  // 4. Return result
  return {
    pair,
    updated: enrichedFields.length > 0,
    enriched_fields: enrichedFields
  };
}
