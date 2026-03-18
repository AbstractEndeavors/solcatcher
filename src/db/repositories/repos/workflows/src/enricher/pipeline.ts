// src/pipeline/orchestrator/enrichment/pipeline.ts
import {
  enrichPDAs,
  enrichGenesis,
  enrichMetaDataLink,
  enrichOnchainMeta,
  enrichOffchainMeta,
} from './enricher.js';
import {buildEnrichmentContext} from './context.js'
export { safeEnrich } from './enricher.js';
import type { EnrichmentContext,Enricher } from '@imports';
import { getDeps,type AllDeps } from '@repoServices';
import {persistChanges} from './utils/index.js';
/** Enrichment pipeline - registry of ordered enrichers */
export const ENRICHMENT_PIPELINE: readonly Enricher[] = [
  enrichPDAs,
  enrichGenesis,
  enrichMetaDataLink,
  enrichOnchainMeta,
  enrichOffchainMeta
] as const;
/** Execute full enrichment pipeline */
export async function runEnrichmentPipeline(
    enrichers: readonly Enricher[] = ENRICHMENT_PIPELINE,
    ctx: EnrichmentContext,
    deps:AllDeps
): Promise<void> {
  
    deps = await getDeps(deps)
    // Fetch all data ONCE at start
    ctx = await buildEnrichmentContext(deps,ctx);
    
    // Run all enrichers (pure transformations, no DB)
    for (const enricher of enrichers) {
        ctx = await enricher(ctx,deps);
    }
    
    // Persist all changes ONCE at end
    ctx = await persistChanges(ctx);
}// src/index.ts

