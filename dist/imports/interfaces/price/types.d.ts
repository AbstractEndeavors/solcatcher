/**
 * Precise price representation.
 * Stores both the computed float AND the scaled integer for verification.
 */
export interface PrecisePrice {
    scaled: bigint;
    scale: bigint;
    float: number;
}
