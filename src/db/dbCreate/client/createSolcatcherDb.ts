// src/db/dbCreate/client/createSolcatcherDb.ts
//
// UPDATED: wires staging DB into TransactionsService write path.
//
// loadStagingEnv() is called once at app init — it queries the
// registry to find the active DB at startup. The drain process
// handles swaps; the pipeline process reconnects on next restart
// or you can add a swap listener later.

import { loadPostgresEnv, loadStagingEnv, type DatabaseClient } from "@imports";
import { createDatabaseConfig } from "./../config/index.js";
import { createDatabaseClient } from "./helper_functions.js";
import { createRepositoryRegistry } from "./../../repositories/index.js";
import { ApplicationContainer } from "../container/ApplicationContainer.js";

// ============================================================
// CONFIG BUILDERS
// ============================================================

export function createDbConfig(env: any = null) {
  env = env || loadPostgresEnv();
  return createDatabaseConfig(env);
}

export function createDbClient(env: any = null) {
  const config = createDbConfig(env);
  return createDatabaseClient(config);
}

// ============================================================
// APP FACTORY — explicit staging wiring
// ============================================================

export function createDbApp(
  megaClient:    DatabaseClient,
  stagingClient: DatabaseClient,
): ApplicationContainer {
  const repos = createRepositoryRegistry(megaClient, stagingClient);
  return new ApplicationContainer(megaClient, repos);
}
export async function initializeDbApp(env: any = null): Promise<ApplicationContainer> {
  const megaClient    = createDbClient(env);                              // mega — reads
  const stagingEnv    = await loadStagingEnv();                          // queries registry
  const stagingClient = createDbClient(stagingEnv);                      // staging — writes
  const app = await createDbApp(megaClient,stagingClient);
  await app.initialize();
  return app;
}

export async function createSolcatcherDbApp(env: any = null): Promise<ApplicationContainer> {
  return await initializeDbApp(env);
}


let _app: ApplicationContainer | null = null;

export function getDbApp(
  megaClient:    DatabaseClient,
  stagingClient: DatabaseClient,
): ApplicationContainer {
  if (!_app) {
    _app = createDbApp(megaClient, stagingClient);
  }
  return _app;
}