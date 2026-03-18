import { MetaDataRepository } from './../MetaDataRepository.js';
import { type MetaDataRow } from '@imports';
import type { MetadataUpsertInput, IdLike } from '@imports';
export declare function upsertGenesis(this: MetaDataRepository, input: MetadataUpsertInput): Promise<MetaDataRow>;
export declare function enrichOnchain(this: MetaDataRepository, id: IdLike, params: MetadataUpsertInput): Promise<IdLike>;
export declare function enrichOffchain(this: MetaDataRepository, id: IdLike, params: MetadataUpsertInput): Promise<IdLike>;
