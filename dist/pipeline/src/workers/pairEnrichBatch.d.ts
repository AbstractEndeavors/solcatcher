import { BatchWorker, type BatchWorkerConfig } from './base.js';
import type { PairEnrichPayload } from '@imports';
export interface PairEnrichBatchWorkerDeps {
    pairsRepo: {
        fetchStubs(limit: number): Promise<Array<{
            id: number;
            mint: string;
            program_id: string;
        }>>;
    };
}
export declare class PairEnrichBatchWorker extends BatchWorker<'pairEnrich'> {
    private readonly deps;
    constructor(config: Omit<BatchWorkerConfig<'pairEnrich'>, 'name' | 'queue'>, deps: PairEnrichBatchWorkerDeps);
    protected fetchBatch(): Promise<PairEnrichPayload[]>;
}
