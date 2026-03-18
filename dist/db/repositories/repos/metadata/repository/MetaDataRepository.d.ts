import { type MetaDataRow } from '@imports';
import type { DatabaseClient } from '@imports';
import type { IdLike, MintLike } from '@imports';
import * as src from './src/index.js';
export type MetaDataRepositoryBindings = typeof src;
export interface MetaDataRepository extends MetaDataRepositoryBindings {
}
export declare class MetaDataRepository {
    readonly db: DatabaseClient;
    constructor(db: DatabaseClient);
    private executeIndexCreation;
    createTable(): Promise<void>;
    rowToModel(row: any): MetaDataRow;
    markProcessed(mint: MintLike): Promise<IdLike>;
}
export declare function createMetaDataRepository(db: DatabaseClient): MetaDataRepository;
