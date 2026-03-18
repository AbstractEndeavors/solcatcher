import { PairsRepository } from '../PairsRepository.js';
import { type IdLike } from '@imports';
export declare function appendTcns(this: PairsRepository, pairId: IdLike, txnIds: IdLike[]): Promise<IdLike>;
export declare function appendTransaction(this: PairsRepository, pair_id: IdLike, txn_id: IdLike): Promise<void>;
