import { LogOrchestrator } from './../LogOrchestrator.js';
import type { IdLike, PairRow, PairsIngestResult, PairsIngestParams, IntLike } from '@imports';
/**
   * Get fresh pair data with volume update
   */
export declare function getFreshPair(this: LogOrchestrator, params: PairsIngestParams): Promise<PairRow | null>;
/**
   * Get fresh pair data with volume update
   */
export declare function getFreshPairById(this: LogOrchestrator, id: IdLike): Promise<PairRow | null>;
/**
 * Get fresh pair by mint
 */
export declare function getFreshPairByMint(this: LogOrchestrator, mint: string): Promise<PairRow | null>;
/**
 * Batch refresh multiple pairs
 */
export declare function refreshPairBatch(this: LogOrchestrator, pairIds: IdLike[]): Promise<PairsIngestResult[]>;
/**
 * Extract log payloads for pair analysis
 *
 * UPDATED: fetchAndDecodeInsertLogDataPayloads now returns IngestResult.
 * Old code indexed into array: payloads[0].length
 * New code reads: result.payload_count
 */
export declare function extractPairPayloads(this: LogOrchestrator, pair: PairRow): Promise<{
    created: IntLike;
    fields: string[];
}>;
