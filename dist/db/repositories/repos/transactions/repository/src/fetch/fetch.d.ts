import { TransactionsRepository } from './../../TransactionsRepository.js';
import type { TransactionsRow, IdLike, LimitLike, AddressLike, PaginationCursor } from '@imports';
export declare function fetchLatest(this: TransactionsRepository, limit: LimitLike): Promise<TransactionsRow[]>;
export declare function fetchOldest(this: TransactionsRepository, limit: LimitLike): Promise<TransactionsRow[]>;
export declare function fetchPageByPair(this: TransactionsRepository, pairId: IdLike, cursor: PaginationCursor): Promise<TransactionsRow[]>;
export declare function fetchPageByUser(this: TransactionsRepository, userAddress: AddressLike, cursor: PaginationCursor): Promise<TransactionsRow[]>;
