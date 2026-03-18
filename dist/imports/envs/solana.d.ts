export declare function loadSolanaEnv(): {
    pumpFunProgramId: string;
    dbMaxClients: number;
    idleTimeoutMs: number;
    connectionTimeoutMs: number;
    batchSize: number;
    pauseDurationMs: number;
    metaplexToken: string;
    computeBudget: string;
    jupiterAggregator: string;
    usdcMint: string;
    pumpFunAccount: string;
    tokenProgram: string;
    raydiumPoolV4ProgramId: string;
    solanaMint: string;
    solDecimals: number;
    solLamports: number;
    fallbackRpcUrl: string;
    wsUrl: string;
    fallbackWsUrl: string;
    mainnetRpcUrl: string;
    broadcastPort: number;
    rpcUrl: string;
};
export declare function getRateLimiterUrls(): {
    urls: import("../index.js").UrlDict[];
    fallbackUrl: import("../index.js").UrlDict;
};
