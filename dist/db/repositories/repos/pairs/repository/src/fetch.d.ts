import { PairsRepository } from '../PairsRepository.js';
import type { IdLike, AddressLike, PairRow, MintLike, LimitLike, SigLike } from '@imports';
export declare function fetch(this: PairsRepository, params: {
    id?: IdLike;
    mint?: MintLike;
    program_id?: AddressLike;
    bonding_curve?: AddressLike;
    associated_bonding_curve?: AddressLike;
    signature?: SigLike;
}): Promise<PairRow | null>;
export declare function fetchById(this: PairsRepository, id: IdLike): Promise<PairRow | null>;
export declare function fetchByBondingCurve(this: PairsRepository, curve: AddressLike): Promise<PairRow | null>;
export declare function fetchByAssociatedBondingCurve(this: PairsRepository, curve: AddressLike): Promise<PairRow | null>;
export declare function fetchByGenesisSignature(this: PairsRepository, sig: SigLike): Promise<PairRow | null>;
export declare function fetchByMint(this: PairsRepository, mint: MintLike): Promise<PairRow | null>;
export declare function fetchByMintAndProgram(this: PairsRepository, mint: MintLike, program_id: AddressLike): Promise<PairRow | null>;
export declare function fetchStubs(this: PairsRepository, limit: LimitLike): Promise<PairRow[]>;
export declare function fetchCursor(this: PairsRepository, params: {
    limit: LimitLike;
    cursor_created_at?: Date;
    cursor_id?: IdLike;
}): Promise<PairRow[]>;
