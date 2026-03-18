import {createServer} from 'http';
import {limiterApp} from "./app.js";
import { getFetchManager } from "./../fetcher/makeCalls/index.js";
import {LIMITER_HOST,LIMITER_PORT} from './constants.js';
import {createDbClient,initDeps,type AllDeps} from '@db';
import {loadPostgresEnv,loadStagingEnv} from '@imports'
export async function initLimiterServer(port: any = null, host: any = null) {
  // Seed clients before server starts — same pattern as bootstrap
  const megaClient    = createDbClient(loadPostgresEnv());
  const stagingClient = createDbClient(await loadStagingEnv());

  const deps = await initDeps({ megaClient, stagingClient });

  await startLimiterServer(port,host,deps);
}
export async function startLimiterServer(port: any = null, host: any = null,deps:AllDeps) {
  host = host || LIMITER_HOST;
  port = parseInt(port || LIMITER_PORT);
  const limiter = await getFetchManager()
  // 🔥 initialize services first
  const limitApp = await limiterApp(deps.fetchManager)
  createServer(limitApp).listen(port, host, () => {
    console.log(`TS server running on ${host}:${port}`);
  });
}
