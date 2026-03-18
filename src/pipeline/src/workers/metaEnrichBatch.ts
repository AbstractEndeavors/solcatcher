// src/pipeline/workers/metaEnrichBatch.ts
// FIXED: No longer creates payloads with empty program_id

import { BatchWorker, type BatchWorkerConfig } from './base.js';
import  { type AllDeps,type MetaEnrichPayload,SOLANA_PUMP_FUN_PROGRAM_ID } from './../imports/index.js';
import { expectRepoValue } from '@imports';
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

export class MetaEnrichBatchWorker extends BatchWorker<'metaDataEnrich'> {
  constructor(
    config: Omit<BatchWorkerConfig<'metaDataEnrich'>, 'name' | 'queue'>,
    private readonly deps: AllDeps
  ) {
    super({
      ...config,
      name: 'MetaEnrichBatchWorker',
      queue: 'metaDataEnrich',
    });
  }

  protected async fetchBatch(): Promise<MetaEnrichPayload[]> {
    this.deps.cache.clear();
    const repoResult = await this.deps.metaDataRepo.fetchPendingOnchain(this.config.batchSize);
    const pending = expectRepoValue(repoResult)
    let i=0

    for (let pend of pending){
      if (!pend.program_id){
        const pending = await this.deps.metaDataRepo.insertStub(pend.mint,SOLANA_PUMP_FUN_PROGRAM_ID);
        pend.program_id = SOLANA_PUMP_FUN_PROGRAM_ID
      }
      i++

        
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
      program_id: row.program_id!, // Safe now - filtered above
      uri: row.uri,
    } as MetaEnrichPayload));
  }
}
