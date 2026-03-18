import { MetaDataRepository } from './../MetaDataRepository.js';
import type { IdLike, IdentityParams, PairIdentityParams, IdentityEnrichParams, MetaDataRow } from '@imports';
export declare function insertIdentity(this: MetaDataRepository, params: IdentityParams): Promise<IdLike>;
export declare function assureIdentity(this: MetaDataRepository, params: PairIdentityParams): Promise<IdLike>;
export declare function assureIdentityEnrich(this: MetaDataRepository, params: PairIdentityParams): Promise<IdentityEnrichParams<MetaDataRow>>;
