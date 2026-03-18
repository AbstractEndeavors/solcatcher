import { type AllDeps } from '@repoServices';
import type { QueueHandler, PipelineDeps, EnrichParams, CreateContextEnrich } from '@Pipeline/src/queues/definitions.js';
export declare function pairEnrich(payload: EnrichParams, deps?: PipelineDeps | AllDeps | null): Promise<CreateContextEnrich>;
export declare function createPairEnrichHandler(deps: PipelineDeps): QueueHandler<'pairEnrich'>;
