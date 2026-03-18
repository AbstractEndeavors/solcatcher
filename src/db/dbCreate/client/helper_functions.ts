// src/db/dbCreate/client/helper_functions.ts
//
// FIX: createDatabaseClient was ignoring its config argument and
// always returning getPgPool() — the mega singleton. Staging client
// would have silently pointed at mega.
//
// Now: if a config is provided with connection details, a dedicated
// pool is created for it. getPgPool() is only used for the default
// (mega) client where no explicit config is passed.

import type { QueryResult, QueryResultRow } from "pg";
import { Pool } from "pg";
import { PostgresDatabaseClient } from "./PostgresDatabaseClient.js";
import { adaptPgPool } from "@imports";
import type { DatabaseConfig, DatabaseClient } from "@imports";
import { getPgPool } from "@imports";

const FILE_LOCATION = "src/db/dbCreate/client/helper_functions.ts";

// ============================================================
// FACTORY
// ============================================================

/**
 * Creates a DatabaseClient from a config.
 *
 * If config.pool has connection details (host/database), a dedicated
 * pool is created — this is the staging path.
 *
 * If no pool config is provided, falls back to the mega singleton.
 */
export function createDatabaseClient(config: DatabaseConfig): DatabaseClient {
  const poolConfig = config.pool;

  // Dedicated pool — explicit host/database means non-default target
  if (poolConfig?.host && poolConfig?.database) {
    const rawPool = new Pool({
      host:                    poolConfig.host,
      port:                    poolConfig.port,
      database:                poolConfig.database,
      user:                    poolConfig.user,
      password:                poolConfig.password,
      ssl:                     poolConfig.ssl as any,
      max:                     poolConfig.max,
      idleTimeoutMillis:       poolConfig.idleTimeoutMillis,
      connectionTimeoutMillis: poolConfig.connectionTimeoutMillis,
      statement_timeout:       poolConfig.statement_timeout,
    });
    return new PostgresDatabaseClient(adaptPgPool(rawPool), config);
  }

  // Default: mega singleton pool
  return new PostgresDatabaseClient(getPgPool(), config);
}

// ============================================================
// HELPERS
// ============================================================

export function extractRow<T extends QueryResultRow = any>(
  result: QueryResult<T> | null
): T | null {
  if (!result || typeof result !== "object" || !("rows" in result)) {
    throw new Error("extractRow called with non-QueryResult");
  }
  return result.rows.length > 0 ? result.rows[0] : null;
}

export function extractId(result: QueryResult<any> | null): number | null {
  const row = extractRow(result);
  return row?.id ?? null;
}

export function extractRows<T extends QueryResultRow = any>(
  result: QueryResult<T> | null
): T[] {
  if (!result || !Array.isArray(result.rows)) {
    console.log({
      message:       "extractRows called with invalid result",
      logType:       "error",
      file_location: FILE_LOCATION,
    });
    return [];
  }
  return result.rows;
}