import { MetaDataRepository } from './../MetaDataRepository.js';
import type { IdLike, AddressLike, InsertGenesisParams, MintLike } from '@imports';
export declare function insertStub(this: MetaDataRepository, mint: MintLike, program_id: AddressLike): Promise<IdLike>;
export declare function insertGenesis(this: MetaDataRepository, params: InsertGenesisParams): Promise<IdLike>;
