import { FetchManager } from "./FetchManager.js";

let _fetchManager: FetchManager | null = null;

// Called from initDeps with the already-resolved rateLimiter — no DB calls here
export async function initFetchManager(
  rateLimiter: any,
  commitment: any = "confirmed"
): Promise<FetchManager> {
  if (_fetchManager) return _fetchManager;

  if (!rateLimiter) {
    throw new Error('initFetchManager: rateLimiter is required — pass it from initDeps');
  }
  if (typeof rateLimiter.fetchRpc !== 'function') {
    throw new Error(`initFetchManager: rateLimiter.fetchRpc is not a function`);
  }
  if (typeof rateLimiter.getUrl !== 'function') {
    throw new Error(`initFetchManager: rateLimiter.getUrl is not a function`);
  }

  _fetchManager = new FetchManager(rateLimiter, commitment);
  return _fetchManager;
}

// Sync getter — only valid after initDeps has run
export function getFetchManager(): FetchManager {
  if (!_fetchManager) {
    throw new Error('getFetchManager(): called before initDeps() initialized FetchManager');
  }
  return _fetchManager;
}

export function getFetchManagerStatus() {
  return { initialized: _fetchManager !== null };
}