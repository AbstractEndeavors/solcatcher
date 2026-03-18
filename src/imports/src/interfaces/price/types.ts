/**
 * Precise price representation.
 * Stores both the computed float AND the scaled integer for verification.
 */
export interface PrecisePrice {
  // scaled integer: (sol_amount * SCALE) / token_amount
  scaled: bigint;
  scale: bigint;
  
  // float for convenience (computed from scaled)
  float: number;
}
