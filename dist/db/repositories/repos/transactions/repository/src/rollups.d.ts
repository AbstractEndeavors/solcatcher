import { TransactionsRepository } from './../TransactionsRepository.js';
import type { IdLike, BigIntLike, PairRollup } from '@imports';
export declare function upsertPairRollup(this: TransactionsRepository, pairId: IdLike, solVolume: BigIntLike, tokenVolume: BigIntLike): Promise<void>;
export declare function fetchPairRollup(this: TransactionsRepository, pairId: IdLike): Promise<PairRollup | null>;
