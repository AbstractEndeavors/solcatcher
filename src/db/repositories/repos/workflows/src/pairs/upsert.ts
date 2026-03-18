import {LogOrchestrator} from './../../LogOrchestrator.js';
import {getIdOrNull,PairRow,VolumeAggregate} from '@imports';
/**
 * Compute and update pair volume
 */
export async function refreshPairVolume(
  this:LogOrchestrator,
  pair: PairRow
): Promise<VolumeAggregate | null> {
  const pair_id = getIdOrNull(pair)
  return await this.cfg.transactionsService.sumVolumeByPair(pair_id);

}
