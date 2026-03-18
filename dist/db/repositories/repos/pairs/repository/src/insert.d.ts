import { PairsRepository } from '../PairsRepository.js';
import type { IdLike, PairInsertData } from '@imports';
export declare function insert(this: PairsRepository, params: PairInsertData): Promise<IdLike | null>;
