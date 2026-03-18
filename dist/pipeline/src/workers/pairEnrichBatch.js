// src/pipeline/workers/pairEnrichBatch.ts
// FIXED: Validates program_id before creating payloads
import { BatchWorker } from './base.js';
export class PairEnrichBatchWorker extends BatchWorker {
    deps;
    constructor(config, deps) {
        super({
            ...config,
            name: 'PairEnrichBatchWorker',
            queue: 'pairEnrich',
        });
        this.deps = deps;
    }
    async fetchBatch() {
        const stubs = await this.deps.pairsRepo.fetchStubs(this.config.batchSize);
        // FIX: Filter out invalid rows
        const valid = stubs.filter(row => {
            if (!row.program_id || row.program_id === '') {
                console.log({
                    logType: 'warn',
                    message: 'pairEnrichBatch: skipping row without program_id',
                    details: { pair_id: row.id, mint: row.mint }
                });
                return false;
            }
            if (!row.mint || row.mint === '') {
                console.log({
                    logType: 'warn',
                    message: 'pairEnrichBatch: skipping row without mint',
                    details: { pair_id: row.id, program_id: row.program_id }
                });
                return false;
            }
            return true;
        });
        return valid.map(row => ({
            pair_id: row.id,
            mint: row.mint,
            program_id: row.program_id,
        }));
    }
}
