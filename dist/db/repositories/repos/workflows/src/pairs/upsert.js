import { LogOrchestrator } from './../LogOrchestrator.js';
import { getIdOrNull, PairRow, VolumeAggregate } from '@imports';
/**
 * Compute and update pair volume
 */
export async function refreshPairVolume(pair) {
    const pair_id = getIdOrNull(pair);
    return await this.cfg.Transactions.sumVolumeByPair(pair_id);
}
