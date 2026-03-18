import type {MetaDataRow} from './schemas.js';
// constants.ts
export const META_DATA_ENRICH_GROUPS = {
  genesis:  ['discriminator', 'user_address', 'creator', 'signature', 'program_id', 'timestamp'],
  pda:      ['bonding_curve', 'associated_bonding_curve', 'metadata_pda', 'token_standard'],
  onchain:  ['update_authority', 'freeze_authority', 'seller_fee_basis_points', 'is_mutable', 'primary_sale_happened', 'name', 'symbol', 'uri'],
  offchain: ['image', 'description', 'external_url'],
} as const satisfies Record<string, ReadonlyArray<keyof MetaDataRow>>;

export type MetaDataEnrichGroup = keyof typeof META_DATA_ENRICH_GROUPS;