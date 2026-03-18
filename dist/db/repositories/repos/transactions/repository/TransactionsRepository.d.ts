import type { DatabaseClient, TransactionsInsertParams } from "@imports";
import { TransactionsRow } from "@imports";
import type { IdLike } from '@imports';
import * as src from './src/index.js';
export type TransactionsRepositoryBindings = typeof src;
export interface TransactionsRepository extends TransactionsRepositoryBindings {
}
export declare class TransactionsRepository {
    readonly db: DatabaseClient;
    constructor(db: DatabaseClient);
    private rowToModel;
    mapRow: (row: any) => TransactionsRow;
    fetchByIds: (ids: IdLike[]) => Promise<TransactionsRow[]>;
    insertBatch(txns: TransactionsInsertParams[]): Promise<number[]>;
}
