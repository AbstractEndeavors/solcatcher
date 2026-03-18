// src/pipeline/pda/constants.ts
import { PublicKey } from '@solana/web3.js';
// ═══════════════════════════════════════════════════════════
// PROGRAM IDS
// ═══════════════════════════════════════════════════════════
export const PROGRAM_IDS = {
    /** Metaplex Token Metadata Program */
    METADATA: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
    /** Pump.fun AMM Program */
    PUMP_FUN: new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'),
    /** Pump.fun AMM V2 (if applicable) */
    PUMP_AMM: new PublicKey('pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA'),
    /** SPL Token Program */
    TOKEN: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    /** SPL Token 2022 Program */
    TOKEN_2022: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
    /** Associated Token Account Program */
    ASSOCIATED_TOKEN: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
    /** System Program */
    SYSTEM: new PublicKey('11111111111111111111111111111111'),
};
// ═══════════════════════════════════════════════════════════
// PDA SEEDS
// ═══════════════════════════════════════════════════════════
export const SEEDS = {
    /** Metaplex metadata seed */
    METADATA: Buffer.from('metadata'),
    /** Pump.fun bonding curve seed */
    BONDING_CURVE: Buffer.from('bonding-curve'),
    /** Associated token account seed (implicit in ATA derivation) */
    ASSOCIATED: Buffer.from('associated'),
};
// ═══════════════════════════════════════════════════════════
// ACCOUNT LAYOUTS
// ═══════════════════════════════════════════════════════════
/** Bonding curve account discriminator */
export const BONDING_CURVE_DISCRIMINATOR = Buffer.from([
    0x17, 0xb7, 0xf8, 0x37, 0x60, 0xd8, 0xac, 0x60
]);
/** Bonding curve account layout offsets */
export const BONDING_CURVE_LAYOUT = {
    DISCRIMINATOR: { offset: 0, size: 8 },
    MINT: { offset: 8, size: 32 },
    CREATOR: { offset: 40, size: 32 },
    VIRTUAL_TOKEN_RESERVES: { offset: 72, size: 8 },
    VIRTUAL_SOL_RESERVES: { offset: 80, size: 8 },
    REAL_TOKEN_RESERVES: { offset: 88, size: 8 },
    REAL_SOL_RESERVES: { offset: 96, size: 8 },
    TOKEN_TOTAL_SUPPLY: { offset: 104, size: 8 },
    IS_COMPLETE: { offset: 112, size: 1 },
    TOKEN_PROGRAM: { offset: 113, size: 32 },
    TOTAL_SIZE: 145,
};
