import { type MintLike, type EnrichParams } from './../../interfaces/index.js';
import { type AllDeps, type PipelineDeps } from './../db.js';
export declare function getPayload(payload?: EnrichParams | null, deps?: PipelineDeps | AllDeps | null): Promise<EnrichParams | null>;
export declare function getMint(payload?: EnrichParams | null, deps?: PipelineDeps | AllDeps | null): Promise<MintLike | null>;
export declare function isSigEnrich(payload?: EnrichParams | null, deps?: PipelineDeps | AllDeps | null): Promise<boolean>;
