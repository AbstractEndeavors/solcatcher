import { PairsRepository } from '../PairsRepository.js';
import type { IdLike, IdentityParams, PairIdentityParams, IdentityEnrichParams, PairRow } from '@imports';
export declare function insertIdentity(this: PairsRepository, params: IdentityParams): Promise<IdLike>;
export declare function assureIdentity(this: PairsRepository, params: PairIdentityParams): Promise<IdLike>;
export declare function assureIdentityEnrich(this: PairsRepository, params: PairIdentityParams): Promise<IdentityEnrichParams<PairRow>>;
