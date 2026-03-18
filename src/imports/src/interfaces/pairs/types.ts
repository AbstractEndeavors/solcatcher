import type {IdLike,AddressLike,MintLike,Identity} from './imports.js';
import {PairRow} from './schemas.js';
export interface PairData {      
  genesis_signature?: AddressLike,
  program_id: AddressLike,
  mint: MintLike,
  price_token?: AddressLike,
  creator_address?: AddressLike | null,
  bonding_curve: AddressLike | null,
  associated_bonding_curve: AddressLike | null,
  meta_id: IdLike | null,
  log_id: IdLike | null
}

export interface PairsIngestParams {
  pair?: PairRow | null;
  id?: IdLike;
  mint?: string;
  pair_id?: IdLike;
}

export interface PairsIngestResult {
  pair: PairRow | null;
  updated: boolean;
  enriched_fields: string[];
}

export interface PairIdentityParams extends Identity {
    bonding_curve?:AddressLike,
    associated_bonding_curve?:AddressLike,
}
