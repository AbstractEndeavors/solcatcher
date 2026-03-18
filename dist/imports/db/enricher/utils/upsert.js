// src/pipeline/orchestrator/enrichment/enrichers.ts
import { getRepoServices } from '@repoServices';
import { createEnrichmentContext } from './context.js';
import {} from '@imports';
export async function persistChanges(ctx) {
    let { pair, meta, enrich_fields } = ctx;
    if (enrich_fields.pair && enrich_fields.pair.length > 0) {
        const { pairsRepo } = await getRepoServices.repos();
        ctx.pair = await pairsRepo.upsert(pair);
        ctx.enrich_fields.pair = [];
    }
    if (enrich_fields.meta && enrich_fields.meta.length > 0) {
        const { metaDataRepo } = await getRepoServices.repos();
        ctx.meta = await metaDataRepo.upsertGenesis(meta);
        ctx.enrich_fields.meta = [];
    }
    return ctx;
}
