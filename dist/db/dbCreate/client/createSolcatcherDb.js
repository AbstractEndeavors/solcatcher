import { loadPostgresEnv } from "@imports";
import { createDatabaseConfig } from './../config/index.js';
import { createDatabaseClient } from "./helper_functions.js";
import { createRepositoryRegistry } from "./../../repositories/index.js";
import { ApplicationContainer } from "../container/ApplicationContainer.js";
// wherever you build the repo
export function createDbConfig(env = null) {
    env = env || loadPostgresEnv();
    return createDatabaseConfig(env);
}
export function createDbClient(env = null) {
    const config = createDbConfig(env);
    return createDatabaseClient(config);
}
export function createDbApp(env = null) {
    const db = createDbClient(env);
    const repos = createRepositoryRegistry(db);
    return new ApplicationContainer(db, repos);
}
export async function initializeDbApp(env = null) {
    const app = createDbApp(env);
    await app.initialize();
    return app;
}
export async function createSolcatcherDbApp(env = null) {
    return await initializeDbApp(env);
}
let app = null;
export async function getDbApp() {
    if (!app) {
        app = await createSolcatcherDbApp();
    }
    return app;
}
