// src/env/postgres.ts
import { getEnvValue, ENVPATH } from './imports.js';
let PostgresDisplayed = false;
export function loadPostgresEnv() {
    const host = getEnvValue({ key: "SOLCATCHER_POSTGRESQL_HOST", startPath: ENVPATH }) || "127.0.0.1";
    const port = parseInt(getEnvValue({ key: "SOLCATCHER_POSTGRESQL_PORT", startPath: ENVPATH }) || "5432", 10);
    const user = getEnvValue({ key: "SOLCATCHER_POSTGRESQL_USER", startPath: ENVPATH }) || "solcatcher";
    const password = getEnvValue({ key: "SOLCATCHER_POSTGRESQL_PASS", startPath: ENVPATH }) || "solcatcher123!!!456";
    const database = getEnvValue({ key: "SOLCATCHER_POSTGRESQL_NAME", startPath: ENVPATH }) || "solcatcher";
    const out = {
        host,
        port,
        user,
        password,
        database,
        url: `postgresql://${user}:${password}@${host}:${port}/${database}`,
    };
    /*if (PostgresDisplayed == false){
    console.log("📦 postgres config:", out);
    PostgresDisplayed=true
  }*/
    return out;
}
