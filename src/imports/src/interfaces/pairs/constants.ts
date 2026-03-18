import {PairRow} from './schemas.js';
// enrichment-groups.ts — schema over ad-hoc
export const PAIR_ENRICH_GROUPS = {
  genesis: ['signature', 'bonding_curve', 'creator', 'timestamp',
            'virtual_token_reserves', 'virtual_sol_reserves',
            'real_token_reserves', 'token_total_supply'],
  pda:     ['token_program', 'associated_bonding_curve'],
  provenance: ['log_id', 'meta_id'],
} as const satisfies Record<string, ReadonlyArray<keyof PairRow>>;
export type PairEnrichGroup = keyof typeof PAIR_ENRICH_GROUPS;





