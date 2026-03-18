import { type EnrichmentContext, type CreateContextEnrich } from './../../interfaces/index.js';
import type { EnrichmentRepos } from './../db.js';
/**
 * Build an EnrichmentContext from params.
 *
 * @param forceFresh - when true, always re-fetches pair and meta from DB.
 *   Use `true` after persisting changes (the old fetchEnrichmentContext).
 *   Default `false` uses cached rows from params if present
 *   (the old createEnrichmentContext).
 */
export declare function buildEnrichmentContext(repos: EnrichmentRepos, params: CreateContextEnrich, forceFresh?: boolean): Promise<EnrichmentContext>;
