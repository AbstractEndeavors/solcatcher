// src/pipeline/pda/constants.ts

import { PublicKey } from '@solana/web3.js';
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[]; // Error codes that should trigger retry
}
interface ConnectionLimits {
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
}
// ======================
// DEFAULT CONFIGURATIONS
// ======================

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  retryableErrors: ['40P01', '40001', '57P03'], // Deadlock, serialization, too many connections
};

export const DEFAULT_CONNECTION_LIMITS: ConnectionLimits = {
  maxConnections: 20,
  idleTimeoutMs: 30000,
  connectionTimeoutMs: 10000,
  statementTimeoutMs: 60000,
};

export const SOLANA_METAPLEX_TOKEN_METADATA_PROGRAM='metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
export const SOLANA_PUMP_FUN_AMM_PROGRAM='6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
export const SOLANA_PUMP_FUN_AMM_V2='pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA'
export const SOLANA_SPL_TOKEN_PROGRAM='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
export const SOLANA_TOKEN_2022_PROGRAM='TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
export const SOLANA_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM='ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
export const SOLANA_SYSTEM_PROGRAM='11111111111111111111111111111111'


export const SOLANA_METAPLEX_TOKEN="METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m";
export const SOLANA_COMPUTE_BUDGET="ComputeBudget111111111111111111111111111111";
export const SOLANA_JUPITER_AGGREGATOR="JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
export const SOLANA_USDC_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOLANA_PUMP_FUN_ACCOUNT="Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1";
export const SOLANA_TOKEN_PROGRAM="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const SOLANA_RAYDIUM_POOL_V4_PROGRAM_ID="675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const SOLANA_MINT="So11111111111111111111111111111111111111112";
export const SOLANA_MAINNET_RPC_URL="https://api.mainnet-beta.solana.com";
export const SOLANA_MAINNET_WS_ENDPOINT="wss://api.mainnet-beta.solana.com";
export const PRICE_TOKEN = SOLANA_MINT;
export const PROGRAM_ID_DEFAULT= SOLANA_PUMP_FUN_AMM_PROGRAM
export const SOLANA_PUMP_FUN_PROGRAM_ID=  SOLANA_PUMP_FUN_AMM_PROGRAM
export const DECIMALS = 6
export const SOLANA_SOL_DECIMALS="9";
export const SOLANA_SOL_LAMPORTS="1000000000";


export const PROGRAM_IDS = {
  /** Metaplex Token Metadata Program */
  METADATA: new PublicKey(SOLANA_METAPLEX_TOKEN_METADATA_PROGRAM),
  /** Pump.fun AMM Program */
  PUMP_FUN: new PublicKey(SOLANA_PUMP_FUN_AMM_PROGRAM),
  /** Pump.fun AMM V2 (if applicable) */
  PUMP_AMM: new PublicKey(SOLANA_PUMP_FUN_AMM_V2),
  /** SPL Token Program */
  TOKEN: new PublicKey(SOLANA_SPL_TOKEN_PROGRAM),
  /** SPL Token 2022 Program */
  TOKEN_2022: new PublicKey(SOLANA_TOKEN_2022_PROGRAM),
  /** Associated Token Account Program */
  ASSOCIATED_TOKEN: new PublicKey(SOLANA_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM),
  /** System Program */
  SYSTEM: new PublicKey(SOLANA_SYSTEM_PROGRAM),
} as const;

export const SEEDS = {
  /** Metaplex metadata seed */
  METADATA: Buffer.from('metadata'),
  
  /** Pump.fun bonding curve seed */
  BONDING_CURVE: Buffer.from('bonding-curve'),
  
  /** Associated token account seed (implicit in ATA derivation) */
  ASSOCIATED: Buffer.from('associated'),
} as const;


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
} as const;