import {getFetchManager} from '@rateLimiter'
export async function getUrl(method?: string) {
  const limiter = await getFetchManager()
  return await limiter.getUrl(method)
}

export async function getFallbackUrl(method?: string): Promise<string> {
  const limiter = await getFetchManager()
  return await limiter.getFallbackUrl()
}
