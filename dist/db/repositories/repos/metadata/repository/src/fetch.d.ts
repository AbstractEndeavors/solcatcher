import { MetaDataRepository } from './../MetaDataRepository.js';
import type { IdLike, MetaDataIdentityParams, MetaDataRow, MintLike, LimitLike } from '@imports';
export declare function fetch(this: MetaDataRepository, params: MetaDataIdentityParams): Promise<MetaDataRow | null>;
export declare function fetchById(this: MetaDataRepository, id: IdLike): Promise<MetaDataRow | null>;
export declare function fetchByMint(this: MetaDataRepository, mint: MintLike): Promise<MetaDataRow | null>;
export declare function getIdByMint(this: MetaDataRepository, mint: MintLike): Promise<IdLike | null>;
export declare function fetchPendingUri(this: MetaDataRepository, limit?: LimitLike): Promise<MetaDataRow[]>;
export declare function fetchPendingOnchain(this: MetaDataRepository, limit?: LimitLike): Promise<MetaDataRow[]>;
export declare function fetchBatchByMints(this: MetaDataRepository, mints: string[]): Promise<MetaDataRow[]>;
