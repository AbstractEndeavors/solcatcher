
import {urlToDict,loadSolanaEnv} from '@imports';
export function initRateLimiter(
) {
  const solanaEnv = loadSolanaEnv();
  const solanaMainnetRpcUrl = solanaEnv.rpcUrl
  const solanaFallbackRpcUrl = solanaEnv.fallbackRpcUrl
  if (!solanaEnv.rpcUrl) {
    throw new Error('❌ solanaMainnetRpcUrl is missing');
  }
  if (!solanaEnv.fallbackRpcUrl) {
    throw new Error('❌ solanaFallbackRpcUrl is missing');
  }
  const urls = ([solanaMainnetRpcUrl]).map(urlToDict);
  const fallbackUrl = urlToDict(solanaFallbackRpcUrl);

  return {urls,fallbackUrl}
}
