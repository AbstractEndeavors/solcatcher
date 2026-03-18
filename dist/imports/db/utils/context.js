import {} from '@imports';
import { buildEnrichmentContext } from './../utils/index.js';
// ============================================================
// CONVENIENCE ALIASES — drop-in for existing call sites
// ============================================================
/** @deprecated Use buildEnrichmentContext(repos, params, false) */
export const createEnrichmentContext = (repos, params) => buildEnrichmentContext(repos, params, false);
/** @deprecated Use buildEnrichmentContext(repos, params, true) */
export const fetchEnrichmentContext = (repos, params) => buildEnrichmentContext(repos, params, true);
