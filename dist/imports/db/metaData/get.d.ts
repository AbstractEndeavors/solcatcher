import { type IdLike, type EnrichParams, type MetaDataEnrichmentRow } from './../../interfaces/index.js';
import { type AllDeps, type PipelineDeps } from './../db.js';
import type { EnrichmentRepos } from './../db.js';
export declare function getMetaId(payload?: EnrichParams | null, deps?: PipelineDeps | AllDeps | null): Promise<IdLike | null>;
export declare function getMetaRow(repos: EnrichmentRepos, params: EnrichParams): Promise<MetaDataEnrichmentRow>;
