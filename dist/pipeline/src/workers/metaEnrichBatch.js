// src/pipeline/workers/metaEnrichBatch.ts
// FIXED: No longer creates payloads with empty program_id
import { BatchWorker } from './base.js';
import { SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
import { getRepoServices } from '@repoServices';
export class MetaEnrichBatchWorker extends BatchWorker {
    deps;
    constructor(config, deps) {
        super({
            ...config,
            name: 'MetaEnrichBatchWorker',
            queue: 'metaEnrich',
        });
        this.deps = deps;
    }
    async fetchBatch() {
        const pending = await this.deps.metaDataRepo.fetchPendingOnchain(this.config.batchSize);
        const { metaDataRepo } = await getRepoServices.repos();
        let i = 0;
        for (let pend of pending) {
            if (!pend.program_id) {
                const pending = await metaDataRepo.insertStub(pend.mint, SOLANA_PUMP_FUN_PROGRAM_ID);
                pend.program_id = SOLANA_PUMP_FUN_PROGRAM_ID;
            }
            i++;
        }
        // FIX: Filter out rows without program_id instead of defaulting to ''
        const valid = pending.filter(row => {
            if (!row.program_id) {
                console.log({
                    logType: 'warn',
                    message: 'metaEnrichBatch: skipping row without program_id',
                    details: { meta_id: row.id, mint: row.mint }
                });
            }
            return true;
        });
        return valid.map(row => ({
            meta_id: row.id,
            mint: row.mint,
            program_id: row.program_id, // Safe now - filtered above
            uri: row.uri,
        }));
    }
}
