// src/pipeline/orchestrator/enrichment/pipeline.ts
import { enrichPDAs, enrichGenesis, enrichMetaDataLink, enrichEvents, enrichOnchainMeta, enrichOffchainMeta } from './enricher.js';
import { getDeps } from '@repoServices';
import { createEnrichmentContext, persistChanges } from './utils/index.js';
/** Enrichment pipeline - registry of ordered enrichers */
export const ENRICHMENT_PIPELINE = [
    enrichPDAs,
    enrichGenesis,
    enrichMetaDataLink,
    enrichOnchainMeta,
    enrichOffchainMeta
];
/** Execute full enrichment pipeline */
export async function runEnrichmentPipeline(ctx, deps) {
    // Fetch all data ONCE at start
    ctx = await createEnrichmentContext(ctx);
    // Run all enrichers (pure transformations, no DB)
    for (const enricher of ENRICHMENT_PIPELINE) {
        ctx = await enricher(ctx, deps);
    }
    // Persist all changes ONCE at end
    ctx = await persistChanges(ctx);
    return ctx;
}
