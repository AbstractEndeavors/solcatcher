import type {
  PairEnrichmentRow,
  IdLike,MintLike,
  AddressLike
} from './imports.ts';
export interface FetchMetaDataEnrich {
  pair?:PairEnrichmentRow;
  meta_id?:IdLike;
  mint?:MintLike;
  program_id?:AddressLike;
}
export interface FetchPairDataEnrich {
  pair?:PairEnrichmentRow;
  pair_id?:IdLike;
  mint?:MintLike;
  program_id?:AddressLike;
}
