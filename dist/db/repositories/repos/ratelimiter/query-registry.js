/**
 * RATE LIMITER QUERY REGISTRY
 *
 * Centralized SQL query definitions.
 * Consolidates base and enhanced queries into one registry.
 */
// ============================================================
// QUERY REGISTRY (Single source of truth)
// ============================================================
export const QueryRegistry = {
    // ────────────────────────────────────────────────────────
    // SCHEMA
    // ────────────────────────────────────────────────────────
    CREATE_TABLES: {
        RATE_EVENTS: `
      CREATE TABLE IF NOT EXISTS rate_events (
        id BIGSERIAL PRIMARY KEY,
        netloc TEXT NOT NULL,
        method TEXT NOT NULL,
        time NUMERIC NOT NULL,
        data NUMERIC DEFAULT 0
      );
    `,
        COOLDOWNS: `
      CREATE TABLE IF NOT EXISTS cooldowns (
        netloc TEXT NOT NULL,
        method TEXT NOT NULL,
        until NUMERIC NOT NULL,
        PRIMARY KEY (netloc, method)
      );
    `,
        METHOD_LIMITS: `
      CREATE TABLE IF NOT EXISTS method_limits (
        netloc TEXT NOT NULL,
        method TEXT NOT NULL,
        rate_limit NUMERIC,
        rps_limit NUMERIC,
        retry_after NUMERIC,
        avg_data REAL,
        last_data NUMERIC,
        PRIMARY KEY (netloc, method)
      );
    `,
        URL_REGISTRY: `
      CREATE TABLE IF NOT EXISTS url_registry (
        identifier TEXT PRIMARY KEY,
        netloc TEXT NOT NULL,
        scheme TEXT NOT NULL,
        name TEXT NOT NULL,
        ext TEXT NOT NULL
      );
    `,
        URL_VARIANTS: `
      CREATE TABLE IF NOT EXISTS url_variants (
        identifier TEXT NOT NULL,
        variant TEXT NOT NULL,
        PRIMARY KEY (identifier, variant)
      );
    `,
        RATE_LIMITER_STATE: `
      CREATE TABLE IF NOT EXISTS rate_limiter_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at NUMERIC NOT NULL
      );
    `,
        LAST_MB_TRACKING: `
      CREATE TABLE IF NOT EXISTS last_mb_tracking (
        netloc TEXT NOT NULL,
        method TEXT NOT NULL,
        last_mb REAL NOT NULL,
        updated_at NUMERIC NOT NULL,
        PRIMARY KEY (netloc, method)
      );
    `,
    },
    CREATE_INDEXES: [
        'CREATE INDEX IF NOT EXISTS idx_rate_events_netloc_method_time ON rate_events (netloc, method, time);',
        'CREATE INDEX IF NOT EXISTS idx_rate_events_time ON rate_events (time);',
        'CREATE INDEX IF NOT EXISTS idx_cooldowns_until ON cooldowns (until);',
        'CREATE INDEX IF NOT EXISTS idx_url_registry_netloc ON url_registry (netloc);',
        'CREATE INDEX IF NOT EXISTS idx_url_variants_variant ON url_variants (variant);',
        'CREATE INDEX IF NOT EXISTS idx_last_mb_netloc_method ON last_mb_tracking (netloc, method);',
    ],
    // ────────────────────────────────────────────────────────
    // INSERT/UPSERT
    // ────────────────────────────────────────────────────────
    ADD_RATE_EVENT: `
    INSERT INTO rate_events (netloc, method, time, data)
    VALUES ($1, $2, $3, $4);
  `,
    UPSERT_COOLDOWN: `
    INSERT INTO cooldowns (netloc, method, until)
    VALUES ($1, $2, $3)
    ON CONFLICT (netloc, method)
    DO UPDATE SET until = EXCLUDED.until;
  `,
    UPSERT_METHOD_LIMITS: `
    INSERT INTO method_limits (
      netloc,
      method,
      rate_limit,
      rps_limit,
      retry_after,
      avg_data,
      last_data
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (netloc, method)
    DO UPDATE SET
      rate_limit  = COALESCE(EXCLUDED.rate_limit,  method_limits.rate_limit),
      rps_limit   = COALESCE(EXCLUDED.rps_limit,   method_limits.rps_limit),
      retry_after = COALESCE(EXCLUDED.retry_after, method_limits.retry_after),
      avg_data    = COALESCE(EXCLUDED.avg_data,    method_limits.avg_data),
      last_data   = COALESCE(EXCLUDED.last_data,   method_limits.last_data);
  `,
    UPSERT_URL_REGISTRY: `
    INSERT INTO url_registry (identifier, netloc, scheme, name, ext)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (identifier)
    DO UPDATE SET
      netloc = EXCLUDED.netloc,
      scheme = EXCLUDED.scheme,
      name = EXCLUDED.name,
      ext = EXCLUDED.ext;
  `,
    ADD_URL_VARIANT: `
    INSERT INTO url_variants (identifier, variant)
    VALUES ($1, $2)
    ON CONFLICT (identifier, variant) DO NOTHING;
  `,
    UPSERT_STATE: `
    INSERT INTO rate_limiter_state (key, value, updated_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (key)
    DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = EXCLUDED.updated_at;
  `,
    UPSERT_LAST_MB: `
    INSERT INTO last_mb_tracking (netloc, method, last_mb, updated_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (netloc, method)
    DO UPDATE SET
      last_mb = EXCLUDED.last_mb,
      updated_at = EXCLUDED.updated_at;
  `,
    // ────────────────────────────────────────────────────────
    // SELECT
    // ────────────────────────────────────────────────────────
    GET_RECENT_EVENTS: `
    SELECT time, data
    FROM rate_events
    WHERE netloc = $1
      AND method = $2
      AND time >= $3
    ORDER BY time ASC;
  `,
    GET_COOLDOWN: `
    SELECT until
    FROM cooldowns
    WHERE netloc = $1
      AND method = $2;
  `,
    GET_METHOD_LIMITS: `
    SELECT
      rate_limit,
      rps_limit,
      retry_after,
      avg_data,
      last_data
    FROM method_limits
    WHERE netloc = $1
      AND method = $2;
  `,
    GET_URL_REGISTRY: `
    SELECT identifier, netloc, scheme, name, ext
    FROM url_registry;
  `,
    GET_URL_BY_IDENTIFIER: `
    SELECT netloc, scheme, name, ext
    FROM url_registry
    WHERE identifier = $1;
  `,
    GET_VARIANTS_BY_IDENTIFIER: `
    SELECT variant
    FROM url_variants
    WHERE identifier = $1;
  `,
    GET_IDENTIFIER_BY_VARIANT: `
    SELECT identifier
    FROM url_variants
    WHERE variant = $1
    LIMIT 1;
  `,
    GET_STATE_VALUE: `
    SELECT value
    FROM rate_limiter_state
    WHERE key = $1;
  `,
    GET_ALL_STATE: `
    SELECT key, value
    FROM rate_limiter_state;
  `,
    GET_LAST_MB: `
    SELECT last_mb
    FROM last_mb_tracking
    WHERE netloc = $1 AND method = $2;
  `,
    GET_ALL_LAST_MB_FOR_NETLOC: `
    SELECT method, last_mb
    FROM last_mb_tracking
    WHERE netloc = $1;
  `,
    // ────────────────────────────────────────────────────────
    // DELETE
    // ────────────────────────────────────────────────────────
    PRUNE_OLD_EVENTS: `
    DELETE FROM rate_events
    WHERE time < $1;
  `,
    CLEAR_EXPIRED_COOLDOWNS: `
    DELETE FROM cooldowns
    WHERE until <= $1;
  `,
    CLEAR_URL_VARIANTS: `
    DELETE FROM url_variants
    WHERE identifier = $1;
  `,
};
