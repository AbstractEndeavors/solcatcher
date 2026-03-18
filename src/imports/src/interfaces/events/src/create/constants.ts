
export const CREATE_BIGINT_FIELDS: ReadonlySet<string> = new Set([
  'virtual_token_reserves',
  'virtual_sol_reserves',
  'real_token_reserves',
  'token_total_supply',
  'timestamp',
]);

export const CREATE_STRING_FIELDS: ReadonlySet<string> = new Set([
  'mint',
  'bonding_curve',
  'token_program',
  'user',
  'creator',
  'name',
  'symbol',
  'uri',
]);

export const CREATE_BOOL_FIELDS: ReadonlySet<string> = new Set([
  'is_mayhem_mode',
]);
