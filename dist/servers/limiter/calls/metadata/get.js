import { getFetchManager } from '@rateLimiter';
export async function fetchMetaData(mint) {
    const limiter = await getFetchManager();
    const result = await limiter.fetchMetaData(mint);
    return result;
}
