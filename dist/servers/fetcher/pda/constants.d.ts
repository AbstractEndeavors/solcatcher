import { PublicKey } from '@solana/web3.js';
export declare const PROGRAM_IDS: {
    /** Metaplex Token Metadata Program */
    readonly METADATA: PublicKey;
    /** Pump.fun AMM Program */
    readonly PUMP_FUN: PublicKey;
    /** Pump.fun AMM V2 (if applicable) */
    readonly PUMP_AMM: PublicKey;
    /** SPL Token Program */
    readonly TOKEN: PublicKey;
    /** SPL Token 2022 Program */
    readonly TOKEN_2022: PublicKey;
    /** Associated Token Account Program */
    readonly ASSOCIATED_TOKEN: PublicKey;
    /** System Program */
    readonly SYSTEM: PublicKey;
};
export declare const SEEDS: {
    /** Metaplex metadata seed */
    readonly METADATA: Buffer<ArrayBuffer>;
    /** Pump.fun bonding curve seed */
    readonly BONDING_CURVE: Buffer<ArrayBuffer>;
    /** Associated token account seed (implicit in ATA derivation) */
    readonly ASSOCIATED: Buffer<ArrayBuffer>;
};
/** Bonding curve account discriminator */
export declare const BONDING_CURVE_DISCRIMINATOR: Buffer<ArrayBuffer>;
/** Bonding curve account layout offsets */
export declare const BONDING_CURVE_LAYOUT: {
    readonly DISCRIMINATOR: {
        readonly offset: 0;
        readonly size: 8;
    };
    readonly MINT: {
        readonly offset: 8;
        readonly size: 32;
    };
    readonly CREATOR: {
        readonly offset: 40;
        readonly size: 32;
    };
    readonly VIRTUAL_TOKEN_RESERVES: {
        readonly offset: 72;
        readonly size: 8;
    };
    readonly VIRTUAL_SOL_RESERVES: {
        readonly offset: 80;
        readonly size: 8;
    };
    readonly REAL_TOKEN_RESERVES: {
        readonly offset: 88;
        readonly size: 8;
    };
    readonly REAL_SOL_RESERVES: {
        readonly offset: 96;
        readonly size: 8;
    };
    readonly TOKEN_TOTAL_SUPPLY: {
        readonly offset: 104;
        readonly size: 8;
    };
    readonly IS_COMPLETE: {
        readonly offset: 112;
        readonly size: 1;
    };
    readonly TOKEN_PROGRAM: {
        readonly offset: 113;
        readonly size: 32;
    };
    readonly TOTAL_SIZE: 145;
};
