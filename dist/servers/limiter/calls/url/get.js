import { getFetchManager } from '@rateLimiter';
export async function getUrl(method) {
    const limiter = await getFetchManager();
    return await limiter.getUrl(method);
}
export async function getFallbackUrl(method) {
    const limiter = await getFetchManager();
    return await limiter.getFallbackUrl();
}
