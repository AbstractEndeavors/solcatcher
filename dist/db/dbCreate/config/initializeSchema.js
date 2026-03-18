import { createRateLimiterService } from '@repositories/ratelimiter/index.js';
import { createTableRegistry, sortTables } from './config.js';
import { loadSolanaEnv, urlToDict, } from "@imports";
import { createDbClient } from './../client/index.js';
// dbCreate/config/initializeSchema.ts
// dbCreate/config/initializeSchema.ts
let initialized = false;
export async function initializeSchema(pool) {
    if (initialized)
        return;
    const resolvedPool = pool ??
        (await (async () => {
            const { getPgPool } = await import('@imports');
            return getPgPool();
        })());
    await resolvedPool.query('SELECT 1');
    const registry = await createTableRegistry();
    const tables = sortTables(registry);
    for (const table of tables) {
        await resolvedPool.query(table.creationQuery);
        for (const index of table.indexes) {
            await resolvedPool.query(index);
        }
    }
    initialized = true;
}
export async function initRateLimiter() {
    const db = await createDbClient();
    const solanaEnv = loadSolanaEnv();
    const solanaMainnetRpcUrl = solanaEnv.mainnetRpcUrl;
    const solanaRpcUrl = solanaEnv.rpcUrl;
    const solanaFallbackRpcUrl = solanaEnv.fallbackRpcUrl;
    console.log(`[initRateLimiter] ${solanaMainnetRpcUrl}`);
    console.log(`[initRateLimiter] ${solanaRpcUrl}`);
    console.log(`[initRateLimiter] ${solanaFallbackRpcUrl}`);
    if (!solanaEnv.rpcUrl) {
        throw new Error('❌ solanaMainnetRpcUrl is missing');
    }
    if (!solanaEnv.fallbackRpcUrl) {
        throw new Error('❌ solanaFallbackRpcUrl is missing');
    }
    const normalizedUrls = ([solanaMainnetRpcUrl, solanaRpcUrl]).map(urlToDict);
    const normalizedFallback = urlToDict(solanaFallbackRpcUrl);
    console.log(`[normalizedUrls] ${normalizedUrls}`);
    console.log(`[normalizedFallback] ${normalizedFallback}`);
    const rateLimiterService = await createRateLimiterService({
        db,
        urls: normalizedUrls,
        fallbackUrl: normalizedFallback,
    });
    console.log(`[normalizedUrls] ${solanaEnv.fallbackRpcUrl}`);
    console.log(`[normalizedFallback] ${solanaEnv.rpcUrl}`);
    return rateLimiterService;
}
