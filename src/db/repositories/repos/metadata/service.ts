// src/db/repositories/repos/metadata/service.ts

import {
   MetaDataRepository
   } from './repository/MetaDataRepository.js';
import {
  type MetaDataRow,
  type RepoResult,
  expectSingleRow,
  SOLANA_PUMP_FUN_PROGRAM_ID
} from '@imports';
import type { 
  DatabaseClient,
  MintLike, 
  IdLike, 
  AddressLike,
 } from '@imports';

 
export interface MetaDataServiceConfig {
  db: DatabaseClient;
}

export class MetaDataService {
  private readonly repo: MetaDataRepository;
  readonly r: MetaDataRepository;
  constructor(config: MetaDataServiceConfig) {
    this.repo = new MetaDataRepository(config.db);
    this.r = new MetaDataRepository(config.db);
  }

  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────

  async start(): Promise<void> {
    await this.repo.createTable();
  }

  // ─────────────────────────────────────────────
  // RESOLVE (stub or existing)
  // ─────────────────────────────────────────────

  /**
   * Get or create stub metadata.
   * Returns { id, was_stub } to signal if enrichment is needed.
   */
  async resolveOrStub(mint: MintLike,program_id:AddressLike): Promise<RepoResult<MetaDataRow>> {
    const existing = await this.repo.fetchByMint(mint);
    
    if (existing) {
      return existing;
    }

    const id = await this.repo.insertStub(mint,program_id);
    return existing;
  }



  async fetchBatchByMints(mints: string[],program_ids:AddressLike[]): Promise<RepoResult<MetaDataRow>[]> {
    const outRows:RepoResult<MetaDataRow>[]=[]
    const ids:IdLike[]=[]
    let last_valid_program_id:AddressLike=null
    for (let i=0;i++; i<mints.length){
      let mint:MintLike=null
      let program_id:AddressLike=null
      if (i<mints.length){
        mint = mints[i]
      }if (i<program_ids.length){
        program_id = program_ids[i]
        if (!last_valid_program_id){
          last_valid_program_id=program_id
        }
      }
      if (mint && !program_id){
        program_id = last_valid_program_id || SOLANA_PUMP_FUN_PROGRAM_ID
      }
      if (mint && program_id){
        const nuId = await this.repo.assureIdentity({mint,program_id})
        if (nuId && !ids.includes(nuId.value)){
          ids.push(nuId.value)
          const rows = await this.repo.fetchById(nuId.value)
          const row = expectSingleRow(rows.value)
          if (rows.value && row && row !=null){
            outRows.push(rows)
          }
        }
      }
    }
  return outRows;

}

}

export function createMetaDataService(config: MetaDataServiceConfig): MetaDataService {
  return new MetaDataService(config);
}