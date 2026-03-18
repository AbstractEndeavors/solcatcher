import { PairsRepository } from '../PairsRepository.js';
import type { IdLike, PairUpsertData, PairRow } from '@imports';
export declare function updateChainTimestamp(this: PairsRepository, pairId: IdLike, timestamp: Date): Promise<IdLike>;
export declare function upsert(this: PairsRepository, params: PairUpsertData): Promise<PairRow | null>;
