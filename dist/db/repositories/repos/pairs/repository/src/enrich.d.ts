import { PairsRepository } from '../PairsRepository.js';
import { type IdLike, type AddressLike, type EnrichPairParams } from '@imports';
export declare function enrich(this: PairsRepository, pairId: IdLike, params: EnrichPairParams): Promise<IdLike>;
export declare function enrichFull(this: PairsRepository, pairId: IdLike, params: {
    bonding_curve?: AddressLike;
    associated_bonding_curve?: AddressLike;
    token_program?: AddressLike;
    creator?: AddressLike;
    virtual_token_reserves?: bigint;
    virtual_sol_reserves?: bigint;
    real_token_reserves?: bigint;
    token_total_supply?: bigint;
}): Promise<IdLike>;
