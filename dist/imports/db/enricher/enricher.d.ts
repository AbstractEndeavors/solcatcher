/**
 * ENRICHERS
 *
 * Each enricher is a pure-ish function: (ctx, deps) → ctx
 *
 * Changes from previous version:
 *   - Every enricher takes explicit EnrichmentDeps — no getRepoServices
 *   - enrichMetaDataLink bug fixed (was assigning ctx.meta_id instead of
 *     the locally-derived meta_id)
 *   - Error boundaries: safeEnrich wrapper catches per-enricher and
 *     continues the pipeline
 *   - enrichOnchainMeta data precedence is documented and consistent
 *     (chain data fills gaps, never overwrites existing ctx values)
 *
 * Pattern: Registries over globals, explicit wiring over smart defaults
 */
import { type EnrichmentContext } from '@imports';
import type { EnrichmentDeps } from './enrichment-deps.js';
import { type EnrichmentContextWithEvents } from '@imports';
import { type AllDeps } from '@repoServices';
type Enricher<C extends EnrichmentContext = EnrichmentContext> = (ctx: C, deps: any | AllDeps | null | EnrichmentDeps) => Promise<C>;
/**
 * Wraps an enricher so a single failure doesn't kill the pipeline.
 * Logs the error, returns ctx unchanged.
 */
export declare function safeEnrich<C extends EnrichmentContext>(name: string, fn: Enricher<C>): Enricher<C>;
export declare function enrichPDAs(ctx: EnrichmentContext, _deps?: any | AllDeps | null | EnrichmentDeps): Promise<EnrichmentContext>;
export declare function enrichGenesis(ctx: EnrichmentContext, deps?: any | AllDeps | null | EnrichmentDeps): Promise<EnrichmentContext>;
export declare function enrichMetaDataLink(ctx: EnrichmentContext, deps?: any | AllDeps | null | EnrichmentDeps): Promise<EnrichmentContext>;
export declare function enrichEvents(ctx: EnrichmentContextWithEvents, deps?: any | AllDeps | null | EnrichmentDeps): Promise<EnrichmentContextWithEvents>;
export declare function enrichOnchainMeta(ctx: EnrichmentContext, deps?: any | AllDeps | null | EnrichmentDeps): Promise<EnrichmentContext>;
export declare function enrichOffchainMeta(ctx: EnrichmentContext, deps?: any | AllDeps | null | EnrichmentDeps): Promise<EnrichmentContext>;
export {};
