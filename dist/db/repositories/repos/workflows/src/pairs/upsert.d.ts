import { LogOrchestrator } from './../LogOrchestrator.js';
import { PairRow, VolumeAggregate } from '@imports';
/**
 * Compute and update pair volume
 */
export declare function refreshPairVolume(this: LogOrchestrator, pair: PairRow): Promise<VolumeAggregate | null>;
