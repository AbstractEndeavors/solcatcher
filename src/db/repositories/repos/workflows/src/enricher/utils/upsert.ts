// src/pipeline/orchestrator/enrichment/enrichers.ts
import { getRepoServices } from '@repoServices';
import {createEnrichmentContext} from './context.js'
import {
  type MetaDataTotalInsertParams,
  type PairUpsertData,
  type EnrichmentContext,
  type MetaDataEnrichmentRow,
  type PairEnrichmentRow
} from '@imports';
export async function persistChanges(ctx:EnrichmentContext):Promise<EnrichmentContext>{ 
  let { pair,meta,enrich_fields }= ctx
  if (enrich_fields.pair && enrich_fields.pair.length>0){
      const { pairsRepository } = await getRepoServices.repos();
      ctx.pair = await pairsRepository.upsert(pair as PairUpsertData) as PairEnrichmentRow;
      ctx.enrich_fields.pair=[]
  }
  if (enrich_fields.meta && enrich_fields.meta.length > 0) {
      const { metaDataRepository } = await getRepoServices.repos();
      ctx.meta = await metaDataRepository.upsertGenesis(meta as MetaDataTotalInsertParams) as MetaDataEnrichmentRow;
      ctx.enrich_fields.meta=[]
  }
  return ctx
}
