import type { DatabaseClient } from './../../types.js';
import { PairRow } from '@imports';
import * as src from './src/index.js';
type FetchQueryKey = 'FETCH_BY_ID' | 'FETCH_BY_MINT' | 'FETCH_BY_BONDING_CURVE' | 'FETCH_BY_PROGRAM' | 'FETCH_BY_MINT_AND_PROGRAM' | 'FETCH_BY_ASSOCIATED_BONDING_CURVE' | 'FETCH_BY_SIGNATURE' | 'FETCH_STUBS' | 'FETCH_CURSOR_INITIAL' | 'FETCH_CURSOR';
export type PairsRepositoryBindings = typeof src;
export interface PairsRepository extends PairsRepositoryBindings {
}
export declare class PairsRepository {
    readonly db: DatabaseClient;
    constructor(db: DatabaseClient);
    private executeIndexCreation;
    createTable(): Promise<void>;
    fetchOne(queryKey: FetchQueryKey, param: any): Promise<PairRow | null>;
    rowToModel(row: any): PairRow;
    fetchBatchByMints(mints: string[]): Promise<PairRow[]>;
}
export declare function createPairsRepository(db: DatabaseClient): PairsRepository;
export {};
