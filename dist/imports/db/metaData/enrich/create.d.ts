import { type AllDeps, type QueueHandler } from './imports.js';
export declare function createOnChainMetaDataEnrichHandler(deps: AllDeps): QueueHandler<'onChainMetaDataEnrich'>;
export declare function createOffChainMetaDataEnrichHandler(deps: AllDeps): QueueHandler<'offChainMetaDataEnrich'>;
export declare function createMetaDataEnrichHandler(deps: AllDeps): QueueHandler<'metaDataEnrich'>;
