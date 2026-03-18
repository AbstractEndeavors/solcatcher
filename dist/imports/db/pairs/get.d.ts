import { type PairEnrichmentRow, type EnrichParams } from '@imports';
import type { EnrichmentRepos } from './../db.js';
export declare function getPairRow(repos: EnrichmentRepos, params: EnrichParams): Promise<PairEnrichmentRow>;
