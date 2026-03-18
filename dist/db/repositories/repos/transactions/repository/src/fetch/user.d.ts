import { TransactionsRepository } from './../../TransactionsRepository.js';
import type { TransactionsRow, IdLike, AddressLike, LimitLike } from '@imports';
export declare function fetchByUser(this: TransactionsRepository, userAddress: AddressLike, limit?: LimitLike): Promise<TransactionsRow[]>;
export declare function fetchByUserAndPair(this: TransactionsRepository, userAddress: AddressLike, pairId: IdLike): Promise<TransactionsRow[]>;
export declare function fetchByCreator(this: TransactionsRepository, creator: AddressLike, limit?: LimitLike): Promise<TransactionsRow[]>;
