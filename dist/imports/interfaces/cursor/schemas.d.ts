import type { IdLike, DateLike, LimitLike, SigLike } from './../init_types.js';
import type { TransactionsRow } from './../transactions/index.js';
export declare class PaginationCursor {
    readonly last_created_at: DateLike;
    readonly last_id: IdLike;
    readonly limit: LimitLike;
    readonly before?: SigLike;
    constructor(last_created_at: DateLike, last_id: IdLike, limit?: LimitLike, before?: SigLike);
    get timestamp(): any;
    static initial(limit?: number): PaginationCursor;
    static fromTransaction(tx: TransactionsRow, limit?: number): PaginationCursor;
    next(lastTransaction: TransactionsRow): PaginationCursor;
}
