// src/pipeline/workers/pairEnrichBatch.ts
// FIXED: Validates program_id before creating payloads

import { BatchWorker, type BatchWorkerConfig } from './base.js';
import {type  PairEnrichPayload,expectRepoValue } from '@imports';
import {type AllDeps} from '@db'
export interface PairEnrichBatchWorkerDeps {
  pairsRepo: {
    fetchStubs(limit: number): Promise<Array<{
      id: number;
      mint: string;
      program_id: string;
    }>>;
  };
}

export class PairEnrichBatchWorker extends BatchWorker<'pairEnrich'> {
  constructor(
    config: Omit<BatchWorkerConfig<'pairEnrich'>, 'name' | 'queue'>,
    private readonly deps: AllDeps
  ) {
    super({
      ...config,
      name: 'PairEnrichBatchWorker',
      queue: 'pairEnrich',
    });
  }

  protected async fetchBatch(): Promise<PairEnrichPayload[]> {
    this.deps.cache.clear();
    const repoResult = await this.deps.pairsRepo.fetchStubs(this.config.batchSize);
    const stubs = expectRepoValue(repoResult)
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
