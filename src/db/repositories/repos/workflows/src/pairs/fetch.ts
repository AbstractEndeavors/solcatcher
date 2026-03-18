import {LogOrchestrator} from './../../LogOrchestrator.js';
import type {IdLike,PairRow,PairsIngestResult,PairsIngestParams,LogPayloadContext,IntLike} from '@imports';
/**
   * Get fresh pair data with volume update
   */
export async function getFreshPair(
  this:LogOrchestrator,
  params:PairsIngestParams
): Promise<PairRow | null> {
  const result = await this.ingestPairData(
          
          params
        );
    if (!result || !result.pair){
      return null;
    }
    console.log({
      logType: 'info',
      message: 'pairsIngest complete',
      details: {
        pair_id: result.pair.id,
        mint: result.pair.mint,
        status: result.updated ? 'updated' : 'unchanged',
        enriched_fields: result.enriched_fields
      }
    });

    return result.pair;
  }
/**
   * Get fresh pair data with volume update
   */
export async function getFreshPairById(
  this:LogOrchestrator,
  id: IdLike
): Promise<PairRow | null> {
    const result = await this.ingestPairData(
          { id}
        );
    if (!result || !result.pair){
      return null;
    }
    console.log({
      logType: 'info',
      message: 'pairsIngest complete',
      details: {
        pair_id: result.pair.id,
        mint: result.pair.mint,
        status: result.updated ? 'updated' : 'unchanged',
        enriched_fields: result.enriched_fields
      }
    });

    return result.pair;
  }

  /**
   * Get fresh pair by mint
   */
export async function getFreshPairByMint(
  this:LogOrchestrator,
  mint: string
): Promise<PairRow | null> {
    const result = await this.ingestPairData(
          
          { mint }
    );
    if (!result || !result.pair){
      return null;
    }
    console.log({
      logType: 'info',
      message: 'pairsIngest complete',
      details: {
        pair_id: result.pair.id,
        mint: result.pair.mint,
        status: result.updated ? 'updated' : 'unchanged',
        enriched_fields: result.enriched_fields
      }
    });

    return result.pair;
  }

  /**
   * Batch refresh multiple pairs
   */
export async function refreshPairBatch(
  this:LogOrchestrator,
  pairIds: IdLike[]
): Promise<PairsIngestResult[]> {
    const results: PairsIngestResult[] = [];

    for (const pairId of pairIds) {
      try {
        const result = await this.ingestPairData(
          { id: pairId }
        );
        results.push(result);
      } catch (err) {
        console.error(`Failed to refresh pair ${pairId}:`, err);
      }
    }

    return results;
  }

 /** Extract log payloads for pair analysis
 *
 * UPDATED: fetchAndDecodeInsertLogDataPayloads now returns IngestResult.
 * Old code indexed into array: payloads[0].length
 * New code reads: result.payload_count
 */
export async function extractPairPayloads(
   this:LogOrchestrator,
   pair: PairRow
): Promise<{ created: IntLike; fields: string[] }> {
  const signature = pair.signature
  if (!signature) {
    return { created: 0, fields: [] };
  }
  // Check if payloads already exist
  const existing = await this.cfg.logPayloadRepository.fetchBySignature(signature);
  if (existing && existing.length > 0) {
    return { created: 0, fields: [] };
  }
  // Extract + decode payloads (returns IngestResult)
  const result:LogPayloadContext[] = await this.getLogPayloadContexts(existing);
  const payload_count = result.length
  return {
    created: payload_count,
    fields: payload_count > 0 ? ['payloads_extracted'] : []
  };
}