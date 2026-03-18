import { BatchWorker, type BatchWorkerConfig } from './base.js';
import type { MetaEnrichPayload } from '@imports';
export interface MetaEnrichBatchWorkerDeps {
    metaDataRepo: {
        fetchPendingOnchain(limit: number): Promise<Array<{
            id: number;
            mint: string;
            program_id: string | null;
            uri: string | null;
        }>>;
    };
}
export declare class MetaEnrichBatchWorker extends BatchWorker<'metaEnrich'> {
    private readonly deps;
    constructor(config: Omit<BatchWorkerConfig<'metaEnrich'>, 'name' | 'queue'>, deps: MetaEnrichBatchWorkerDeps);
    protected fetchBatch(): Promise<MetaEnrichPayload[]>;
}
