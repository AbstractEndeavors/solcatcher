import { PublicKey } from '@solana/web3.js';
interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableErrors: string[];
}
interface ConnectionLimits {
    maxConnections: number;
    idleTimeoutMs: number;
    connectionTimeoutMs: number;
    statementTimeoutMs: number;
}
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
export declare const DEFAULT_CONNECTION_LIMITS: ConnectionLimits;
export declare const SOLANA_METAPLEX_TOKEN_METADATA_PROGRAM = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
export declare const SOLANA_PUMP_FUN_AMM_PROGRAM = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
export declare const SOLANA_PUMP_FUN_AMM_V2 = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";
export declare const SOLANA_SPL_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export declare const SOLANA_TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export declare const SOLANA_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
export declare const SOLANA_SYSTEM_PROGRAM = "11111111111111111111111111111111";
export declare const SOLANA_METAPLEX_TOKEN = "METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m";
export declare const SOLANA_COMPUTE_BUDGET = "ComputeBudget111111111111111111111111111111";
export declare const SOLANA_JUPITER_AGGREGATOR = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
export declare const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export declare const SOLANA_PUMP_FUN_ACCOUNT = "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1";
export declare const SOLANA_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export declare const SOLANA_RAYDIUM_POOL_V4_PROGRAM_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export declare const SOLANA_MINT = "So11111111111111111111111111111111111111112";
export declare const SOLANA_MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";
export declare const SOLANA_MAINNET_WS_ENDPOINT = "wss://api.mainnet-beta.solana.com";
export declare const PRICE_TOKEN = "So11111111111111111111111111111111111111112";
export declare const PROGRAM_ID_DEFAULT = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
export declare const SOLANA_PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
export declare const DECIMALS = 6;
export declare const SOLANA_SOL_DECIMALS = "9";
export declare const SOLANA_SOL_LAMPORTS = "1000000000";
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
export {};
