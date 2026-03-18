// src/env/solana.ts
import { urlToDict,requireEnv } from './imports/index.js';
export function loadSolanaEnv() {
  const out = {
    pumpFunProgramId: requireEnv("SOLCATCHER_SOLANA_PUMP_FUN_PROGRAM_ID", "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P") as string,
    dbMaxClients: parseInt(requireEnv("SOLCATCHER_SOLANA_DB_MAX_CLIENTS", "5") as string, 10),
    idleTimeoutMs: parseInt(requireEnv("SOLCATCHER_SOLANA_IDLE_TIMEOUT_MS", "30000") as string, 10),
    connectionTimeoutMs: parseInt(requireEnv("SOLCATCHER_SOLANA_CONNECTION_TIMEOUT_MS", "2000") as string, 10),
    batchSize: parseInt(requireEnv("SOLCATCHER_SOLANA_BATCH_SIZE", "10") as string, 10),
    pauseDurationMs: parseInt(requireEnv("SOLCATCHER_SOLANA_PAUSE_DURATION_MS", "20000") as string, 10),
    metaplexToken: requireEnv("SOLCATCHER_SOLANA_METAPLEX_TOKEN", "METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m") as string,
    computeBudget: requireEnv("SOLCATCHER_SOLANA_COMPUTE_BUDGET", "ComputeBudget111111111111111111111111111111") as string,
    jupiterAggregator: requireEnv("SOLCATCHER_SOLANA_JUPITER_AGGREGATOR", "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4") as string,
    usdcMint: requireEnv("SOLCATCHER_SOLANA_USDC_MINT", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") as string,
    pumpFunAccount: requireEnv("SOLCATCHER_SOLANA_PUMP_FUN_ACCOUNT", "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1") as string,
    tokenProgram: requireEnv("SOLCATCHER_SOLANA_TOKEN_PROGRAM", "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") as string,
    raydiumPoolV4ProgramId: requireEnv("SOLCATCHER_SOLANA_RAYDIUM_POOL_V4_PROGRAM_ID", "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") as string,
    solanaMint: requireEnv("SOLCATCHER_SOLANA_MINT", "So11111111111111111111111111111111111111112") as string,
    solDecimals: parseInt(requireEnv("SOLCATCHER_SOLANA_SOL_DECIMALS", "9") as string, 10),
    solLamports: parseInt(requireEnv("SOLCATCHER_SOLANA_SOL_LAMPORTS", "1000000000") as string, 10),
    fallbackRpcUrl: requireEnv("SOLCATCHER_SOLANA_FALLBACK_RPC_URL", "https://rpc.ankr.com/solana/c3b7fd92e298d5682b6ef095eaa4e92160989a713f5ee9ac2693b4da8ff5a370") as string,
    wsUrl: requireEnv("SOLCATCHER_SOLANA_WS_ENDPOINT", "wss://api.mainnet-beta.solana.com") as string,
    fallbackWsUrl: requireEnv("SOLCATCHER_SOLANA_FALLBACK_WS_ENDPOINT", "wss://rpc.ankr.com/solana/ws/c3b7fd92e298d5682b6ef095eaa4e92160989a713f5ee9ac2693b4da8ff5a370") as string,
    mainnetRpcUrl: requireEnv("SOLCATCHER_SOLANA_MAINNET_RPC_URL", "https://api.mainnet-beta.solana.com") as string,
    broadcastPort: parseInt(requireEnv("SOLCATCHER_WS_BROADCAST_PORT", "6047") as string, 10),
    rpcUrl: requireEnv("SOLCATCHER_SOLANA_RPC_URL", "https://patty-d0mcwd-fast-mainnet.helius-rpc.com") as string};
  /*if (SolanaDisplayed == false){
    console.log(out)
    SolanaDisplayed=true
  }*/
  
  return out
}
export function getRateLimiterUrls() {
  const solanaEnv = loadSolanaEnv();
  const solanaMainnetRpcUrl = solanaEnv.mainnetRpcUrl
   const solanaRpcUrl = solanaEnv.rpcUrl
  const solanaFallbackRpcUrl = solanaEnv.fallbackRpcUrl

  const urls = ([solanaMainnetRpcUrl,solanaRpcUrl]).map(urlToDict);
  const fallbackUrl = urlToDict(solanaFallbackRpcUrl);
  console.log(fallbackUrl)
  return {urls,fallbackUrl}
}
