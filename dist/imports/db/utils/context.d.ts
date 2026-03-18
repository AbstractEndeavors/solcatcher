import { type CreateContextEnrich } from '@imports';
import type { EnrichmentRepos } from './../db.js';
/** @deprecated Use buildEnrichmentContext(repos, params, false) */
export declare const createEnrichmentContext: (repos: EnrichmentRepos, params: CreateContextEnrich) => Promise<import("@imports").EnrichmentContext>;
/** @deprecated Use buildEnrichmentContext(repos, params, true) */
export declare const fetchEnrichmentContext: (repos: EnrichmentRepos, params: CreateContextEnrich) => Promise<import("@imports").EnrichmentContext>;
