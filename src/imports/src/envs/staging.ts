// src/imports/src/envs/staging.ts
//
// Loads connection params for whichever staging DB is currently
// active (intake side) by querying the registry in staging_a.
//
// Pattern: explicit environment wiring — no globals, no caching.
// Every call reflects current registry state.

import { Pool } from "pg";
import type { StagingEnv } from "@repositories/types.js";
import { requireEnv } from "./imports/index.js";

// ============================================================
// REGISTRY QUERY
// ============================================================

interface RegistryRow {
  active_db: "staging_a" | "staging_b";
}

/**
 * Open a one-shot connection to the registry DB (always staging_a),
 * read the active_db, close immediately.
 */
async function readActiveDb(cfg: StagingBaseEnv): Promise<"staging_a" | "staging_b"> {
  const pool = new Pool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: "staging_a",          // registry always lives here
    max: 1,
    connectionTimeoutMillis: 5_000,
  });

  try {
    const result = await pool.query<RegistryRow>(
      "SELECT active_db FROM staging_registry WHERE id = 1"
    );

    if (!result.rows[0]) {
      throw new Error("staging_registry: no row found — has staging_drain.py run init?");
    }

    return result.rows[0].active_db;
  } finally {
    await pool.end();
  }
}

// ============================================================
// BASE CONFIG (host/port/creds, not which DB)
// ============================================================

interface StagingBaseEnv {
  host: string;
  port: number;
  user: string;
  password: string;
}

function loadStagingBaseEnv(): StagingBaseEnv {
  return {
    host:     requireEnv("STAGING_PG_HOST", "127.0.0.1"),
    port:     parseInt(requireEnv("STAGING_PG_PORT", "5432"), 10),
    user:     requireEnv("STAGING_PG_USER", "postgres"),
    password: requireEnv("STAGING_PG_PASSWORD",  ""),
  };
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Returns DatabaseEnv for the currently active staging DB.
 * Queries the registry on every call — no caching, no stale state.
 */
export async function loadStagingEnv(): Promise<StagingEnv> {
  const base = loadStagingBaseEnv();
  const activeDb = await readActiveDb(base);

  return {
    host:     base.host,
    port:     base.port,
    user:     base.user,
    password: base.password,
    database: activeDb,
    url: `postgresql://${base.user}:${base.password}@${base.host}:${base.port}/${activeDb}`,
  };
}

/**
 * Returns DatabaseEnv for staging_a specifically (registry DB).
 * Used when you need a stable connection regardless of swap state.
 */
export function loadStagingRegistryEnv(): StagingEnv {
  const base = loadStagingBaseEnv();
  return {
    host:     base.host,
    port:     base.port,
    user:     base.user,
    password: base.password,
    database: "staging_a",
    url: `postgresql://${base.user}:${base.password}@${base.host}:${base.port}/staging_a`,
  };
}
