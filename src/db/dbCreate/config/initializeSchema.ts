// initializeSchema.ts

import { createTableRegistry, sortTables } from './config.js';
import { type DatabaseClient, type TableSchema ,loadSolanaEnv, urlToDict } from '@imports';
import { createRateLimiterService } from './../../repositories/repos/ratelimiter/index.js';

let initialized = false;

// Changed: PoolLike → DatabaseClient — it only uses .query() anyway
export async function initializeSchema(db: DatabaseClient): Promise<void> {
  if (initialized) return;

  await db.query('SELECT 1');

  const registry = await createTableRegistry();
  const tables: TableSchema[] = sortTables(registry);

  for (const table of tables) {
    await db.query(table.creationQuery);
    for (const index of table.indexes) {
      await db.query(index);
    }
  }

  initialized = true;
}

// Changed: optional db → required db — caller must pass it
export async function initRateLimiter(db: DatabaseClient) {
  const solanaEnv = loadSolanaEnv();
  const { mainnetRpcUrl, rpcUrl, fallbackRpcUrl } = solanaEnv;

  if (!rpcUrl)         throw new Error('❌ rpcUrl is missing');
  if (!fallbackRpcUrl) throw new Error('❌ fallbackRpcUrl is missing');

  const normalizedUrls     = [mainnetRpcUrl, rpcUrl].map(urlToDict);
  const normalizedFallback = urlToDict(fallbackRpcUrl);

  return createRateLimiterService({
    db,
    urls:        normalizedUrls,
    fallbackUrl: normalizedFallback,
  });
}