import { createServer } from "http";
import {serverApp} from "./app.js";
import {TS_HOST,TS_PORT} from './constants.js';
import {createDbClient,initDeps} from '@db';
import {loadPostgresEnv,loadStagingEnv} from '@imports'
export async function initSolcatcherServer(port: any = null, host: any = null) {
  // Seed clients before server starts — same pattern as bootstrap
  const megaClient    = createDbClient(loadPostgresEnv());
  const stagingClient = createDbClient(await loadStagingEnv());

  await initDeps({ megaClient, stagingClient });

  await startSolcatcherServer(port,host);
}
export async function startSolcatcherServer(port: any = null, host: any = null) {
  host = host || TS_HOST;
  port = parseInt(port || TS_PORT);
  const app = await serverApp() 
  createServer(app).listen(port, host, () => {
    console.log(`TS server running on ${host}:${port}`);
  });
}