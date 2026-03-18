import { type FetchPairDataEnrich, type PairEnrichmentRow } from '@imports';
import type { EnrichmentRepos } from './../db.js';
export declare function resolvePairRow(repos: EnrichmentRepos, params: FetchPairDataEnrich): Promise<PairEnrichmentRow>;
