import { LogOrchestrator } from './../LogOrchestrator.js';
/**
   * Get fresh pair data with volume update
   */
export async function getFreshPair(params) {
    const result = await this.ingestPairData(params);
    if (!result || !result.pair) {
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
export async function getFreshPairById(id) {
    const result = await this.ingestPairData({ id });
    if (!result || !result.pair) {
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
export async function getFreshPairByMint(mint) {
    const result = await this.ingestPairData({ mint });
    if (!result || !result.pair) {
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
export async function refreshPairBatch(pairIds) {
    const results = [];
    for (const pairId of pairIds) {
        try {
            const result = await this.ingestPairData({ id: pairId });
            results.push(result);
        }
        catch (err) {
            console.error(`Failed to refresh pair ${pairId}:`, err);
        }
    }
    return results;
}
/**
 * Extract log payloads for pair analysis
 *
 * UPDATED: fetchAndDecodeInsertLogDataPayloads now returns IngestResult.
 * Old code indexed into array: payloads[0].length
 * New code reads: result.payload_count
 */
export async function extractPairPayloads(pair) {
    const signature = pair.signature;
    if (!signature) {
        return { created: 0, fields: [] };
    }
    // Check if payloads already exist
    const existing = await this.cfg.logPayloads.fetchBySignature(signature);
    if (existing && existing.length > 0) {
        return { created: 0, fields: [] };
    }
    // Extract + decode payloads (returns IngestResult)
    const result = await this.fetchAndDecodeInsertLogDataPayloads(existing[0]);
    const payload_count = result.payload_count ?? 0;
    return {
        created: payload_count,
        fields: payload_count > 0 ? ['payloads_extracted'] : []
    };
}
