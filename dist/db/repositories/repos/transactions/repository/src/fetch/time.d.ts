import { TransactionsRepository } from './../../TransactionsRepository.js';
import type { TransactionsRow, IdLike, AddressLike, TimeRange } from '@imports';
export declare function fetchByPairInRange(this: TransactionsRepository, pairId: IdLike, range: TimeRange): Promise<TransactionsRow[]>;
export declare function fetchByUserInRange(this: TransactionsRepository, userAddress: AddressLike, range: TimeRange): Promise<TransactionsRow[]>;
