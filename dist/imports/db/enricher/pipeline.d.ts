import type { EnrichmentContext, Enricher } from '@imports';
import { type AllDeps } from '@repoServices';
/** Enrichment pipeline - registry of ordered enrichers */
export declare const ENRICHMENT_PIPELINE: readonly Enricher[];
/** Execute full enrichment pipeline */
export declare function runEnrichmentPipeline(ctx: EnrichmentContext, deps: AllDeps): Promise<EnrichmentContext>;
