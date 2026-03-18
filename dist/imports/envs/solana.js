// src/env/solana.ts
let SolanaDisplayed = false;
// src/env/solana.ts
import { getEnvValue, urlToDict, ENVPATH } from './imports.js';
export function loadSolanaEnv() {
    const out = {
        pumpFunProgramId: getEnvValue({ key: "SOLCATCHER_SOLANA_PUMP_FUN_PROGRAM_ID", startPath: ENVPATH }) || "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
        dbMaxClients: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_DB_MAX_CLIENTS", startPath: ENVPATH }) || "5", 10),
        idleTimeoutMs: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_IDLE_TIMEOUT_MS", startPath: ENVPATH }) || "30000", 10),
        connectionTimeoutMs: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_CONNECTION_TIMEOUT_MS", startPath: ENVPATH }) || "2000", 10),
        batchSize: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_BATCH_SIZE", startPath: ENVPATH }) || "10", 10),
        pauseDurationMs: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_PAUSE_DURATION_MS", startPath: ENVPATH }) || "20000", 10),
        metaplexToken: getEnvValue({ key: "SOLCATCHER_SOLANA_METAPLEX_TOKEN", startPath: ENVPATH }) || "METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m",
        computeBudget: getEnvValue({ key: "SOLCATCHER_SOLANA_COMPUTE_BUDGET", startPath: ENVPATH }) || "ComputeBudget111111111111111111111111111111",
        jupiterAggregator: getEnvValue({ key: "SOLCATCHER_SOLANA_JUPITER_AGGREGATOR", startPath: ENVPATH }) || "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        usdcMint: getEnvValue({ key: "SOLCATCHER_SOLANA_USDC_MINT", startPath: ENVPATH }) || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        pumpFunAccount: getEnvValue({ key: "SOLCATCHER_SOLANA_PUMP_FUN_ACCOUNT", startPath: ENVPATH }) || "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1",
        tokenProgram: getEnvValue({ key: "SOLCATCHER_SOLANA_TOKEN_PROGRAM", startPath: ENVPATH }) || "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        raydiumPoolV4ProgramId: getEnvValue({ key: "SOLCATCHER_SOLANA_RAYDIUM_POOL_V4_PROGRAM_ID", startPath: ENVPATH }) || "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        solanaMint: getEnvValue({ key: "SOLCATCHER_SOLANA_MINT", startPath: ENVPATH }) || "So11111111111111111111111111111111111111112",
        solDecimals: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_SOL_DECIMALS", startPath: ENVPATH }) || "9", 10),
        solLamports: parseInt(getEnvValue({ key: "SOLCATCHER_SOLANA_SOL_LAMPORTS", startPath: ENVPATH }) || "1000000000", 10),
        fallbackRpcUrl: getEnvValue({ key: "SOLCATCHER_SOLANA_FALLBACK_RPC_URL", startPath: ENVPATH }) || "https://rpc.ankr.com/solana/c3b7fd92e298d5682b6ef095eaa4e92160989a713f5ee9ac2693b4da8ff5a370",
        wsUrl: getEnvValue({ key: "SOLCATCHER_SOLANA_WS_ENDPOINT", startPath: ENVPATH }) || "wss://api.mainnet-beta.solana.com",
        fallbackWsUrl: getEnvValue({ key: "SOLCATCHER_SOLANA_FALLBACK_WS_ENDPOINT", startPath: ENVPATH }) || "wss://rpc.ankr.com/solana/ws/c3b7fd92e298d5682b6ef095eaa4e92160989a713f5ee9ac2693b4da8ff5a370",
        mainnetRpcUrl: getEnvValue({ key: "SOLCATCHER_SOLANA_MAINNET_RPC_URL", startPath: ENVPATH }) || "https://api.mainnet-beta.solana.com",
        broadcastPort: parseInt(getEnvValue({ key: "SOLCATCHER_WS_BROADCAST_PORT", startPath: ENVPATH }) || "6047", 10),
        rpcUrl: getEnvValue({ key: "SOLCATCHER_SOLANA_RPC_URL", startPath: ENVPATH }) || "https://patty-d0mcwd-fast-mainnet.helius-rpc.com"
    };
    /*if (SolanaDisplayed == false){
      console.log(out)
      SolanaDisplayed=true
    }*/
    return out;
}
export function getRateLimiterUrls() {
    const solanaEnv = loadSolanaEnv();
    const solanaMainnetRpcUrl = solanaEnv.mainnetRpcUrl;
    const solanaRpcUrl = solanaEnv.rpcUrl;
    const solanaFallbackRpcUrl = solanaEnv.fallbackRpcUrl;
    const urls = ([solanaMainnetRpcUrl, solanaRpcUrl]).map(urlToDict);
    const fallbackUrl = urlToDict(solanaFallbackRpcUrl);
    console.log(fallbackUrl);
    return { urls, fallbackUrl };
}
