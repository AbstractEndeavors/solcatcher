import { type FetchMetaDataEnrich, type MetaDataEnrichmentRow, type EnrichmentContext } from '@imports';
import type { EnrichmentRepos } from './../db.js';
export declare function resolveMetaRow(repos: EnrichmentRepos, params: FetchMetaDataEnrich): Promise<MetaDataEnrichmentRow>;
export declare function refreshMetaRow(repos: EnrichmentRepos, ctx: EnrichmentContext): Promise<MetaDataEnrichmentRow>;
