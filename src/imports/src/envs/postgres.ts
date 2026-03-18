// src/env/postgres.ts

import { type DatabaseEnv,requireEnv } from './imports/index.js';
export function loadPostgresEnv():DatabaseEnv {
  const host=requireEnv("SOLCATCHER_POSTGRESQL_HOST", "127.0.0.1")  as string
  const port= parseInt(requireEnv("SOLCATCHER_POSTGRESQL_PORT", "5432")  as string, 10)
  const user=requireEnv("SOLCATCHER_POSTGRESQL_USER", "solcatcher")  as string
  const password=requireEnv("SOLCATCHER_POSTGRESQL_PASS", "solcatcher123!!!456")  as string
  const database=requireEnv("SOLCATCHER_POSTGRESQL_NAME", "solcatcher")  as string
  const out =  {
    host,
    port,
    user,
    password,
    database,
    url: `postgresql://${user}:${password}@${host}:${port}/${database}`,
    
  };

  return out
}
