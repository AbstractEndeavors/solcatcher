/**
 * RATE LIMITER QUERY REGISTRY
 *
 * Centralized SQL query definitions.
 * Consolidates base and enhanced queries into one registry.
 */
export declare const QueryRegistry: {
    readonly CREATE_TABLES: {
        readonly RATE_EVENTS: "\n      CREATE TABLE IF NOT EXISTS rate_events (\n        id BIGSERIAL PRIMARY KEY,\n        netloc TEXT NOT NULL,\n        method TEXT NOT NULL,\n        time NUMERIC NOT NULL,\n        data NUMERIC DEFAULT 0\n      );\n    ";
        readonly COOLDOWNS: "\n      CREATE TABLE IF NOT EXISTS cooldowns (\n        netloc TEXT NOT NULL,\n        method TEXT NOT NULL,\n        until NUMERIC NOT NULL,\n        PRIMARY KEY (netloc, method)\n      );\n    ";
        readonly METHOD_LIMITS: "\n      CREATE TABLE IF NOT EXISTS method_limits (\n        netloc TEXT NOT NULL,\n        method TEXT NOT NULL,\n        rate_limit NUMERIC,\n        rps_limit NUMERIC,\n        retry_after NUMERIC,\n        avg_data REAL,\n        last_data NUMERIC,\n        PRIMARY KEY (netloc, method)\n      );\n    ";
        readonly URL_REGISTRY: "\n      CREATE TABLE IF NOT EXISTS url_registry (\n        identifier TEXT PRIMARY KEY,\n        netloc TEXT NOT NULL,\n        scheme TEXT NOT NULL,\n        name TEXT NOT NULL,\n        ext TEXT NOT NULL\n      );\n    ";
        readonly URL_VARIANTS: "\n      CREATE TABLE IF NOT EXISTS url_variants (\n        identifier TEXT NOT NULL,\n        variant TEXT NOT NULL,\n        PRIMARY KEY (identifier, variant)\n      );\n    ";
        readonly RATE_LIMITER_STATE: "\n      CREATE TABLE IF NOT EXISTS rate_limiter_state (\n        key TEXT PRIMARY KEY,\n        value TEXT NOT NULL,\n        updated_at NUMERIC NOT NULL\n      );\n    ";
        readonly LAST_MB_TRACKING: "\n      CREATE TABLE IF NOT EXISTS last_mb_tracking (\n        netloc TEXT NOT NULL,\n        method TEXT NOT NULL,\n        last_mb REAL NOT NULL,\n        updated_at NUMERIC NOT NULL,\n        PRIMARY KEY (netloc, method)\n      );\n    ";
    };
    readonly CREATE_INDEXES: readonly ["CREATE INDEX IF NOT EXISTS idx_rate_events_netloc_method_time ON rate_events (netloc, method, time);", "CREATE INDEX IF NOT EXISTS idx_rate_events_time ON rate_events (time);", "CREATE INDEX IF NOT EXISTS idx_cooldowns_until ON cooldowns (until);", "CREATE INDEX IF NOT EXISTS idx_url_registry_netloc ON url_registry (netloc);", "CREATE INDEX IF NOT EXISTS idx_url_variants_variant ON url_variants (variant);", "CREATE INDEX IF NOT EXISTS idx_last_mb_netloc_method ON last_mb_tracking (netloc, method);"];
    readonly ADD_RATE_EVENT: "\n    INSERT INTO rate_events (netloc, method, time, data)\n    VALUES ($1, $2, $3, $4);\n  ";
    readonly UPSERT_COOLDOWN: "\n    INSERT INTO cooldowns (netloc, method, until)\n    VALUES ($1, $2, $3)\n    ON CONFLICT (netloc, method)\n    DO UPDATE SET until = EXCLUDED.until;\n  ";
    readonly UPSERT_METHOD_LIMITS: "\n    INSERT INTO method_limits (\n      netloc,\n      method,\n      rate_limit,\n      rps_limit,\n      retry_after,\n      avg_data,\n      last_data\n    )\n    VALUES ($1, $2, $3, $4, $5, $6, $7)\n    ON CONFLICT (netloc, method)\n    DO UPDATE SET\n      rate_limit  = COALESCE(EXCLUDED.rate_limit,  method_limits.rate_limit),\n      rps_limit   = COALESCE(EXCLUDED.rps_limit,   method_limits.rps_limit),\n      retry_after = COALESCE(EXCLUDED.retry_after, method_limits.retry_after),\n      avg_data    = COALESCE(EXCLUDED.avg_data,    method_limits.avg_data),\n      last_data   = COALESCE(EXCLUDED.last_data,   method_limits.last_data);\n  ";
    readonly UPSERT_URL_REGISTRY: "\n    INSERT INTO url_registry (identifier, netloc, scheme, name, ext)\n    VALUES ($1, $2, $3, $4, $5)\n    ON CONFLICT (identifier)\n    DO UPDATE SET\n      netloc = EXCLUDED.netloc,\n      scheme = EXCLUDED.scheme,\n      name = EXCLUDED.name,\n      ext = EXCLUDED.ext;\n  ";
    readonly ADD_URL_VARIANT: "\n    INSERT INTO url_variants (identifier, variant)\n    VALUES ($1, $2)\n    ON CONFLICT (identifier, variant) DO NOTHING;\n  ";
    readonly UPSERT_STATE: "\n    INSERT INTO rate_limiter_state (key, value, updated_at)\n    VALUES ($1, $2, $3)\n    ON CONFLICT (key)\n    DO UPDATE SET\n      value = EXCLUDED.value,\n      updated_at = EXCLUDED.updated_at;\n  ";
    readonly UPSERT_LAST_MB: "\n    INSERT INTO last_mb_tracking (netloc, method, last_mb, updated_at)\n    VALUES ($1, $2, $3, $4)\n    ON CONFLICT (netloc, method)\n    DO UPDATE SET\n      last_mb = EXCLUDED.last_mb,\n      updated_at = EXCLUDED.updated_at;\n  ";
    readonly GET_RECENT_EVENTS: "\n    SELECT time, data\n    FROM rate_events\n    WHERE netloc = $1\n      AND method = $2\n      AND time >= $3\n    ORDER BY time ASC;\n  ";
    readonly GET_COOLDOWN: "\n    SELECT until\n    FROM cooldowns\n    WHERE netloc = $1\n      AND method = $2;\n  ";
    readonly GET_METHOD_LIMITS: "\n    SELECT\n      rate_limit,\n      rps_limit,\n      retry_after,\n      avg_data,\n      last_data\n    FROM method_limits\n    WHERE netloc = $1\n      AND method = $2;\n  ";
    readonly GET_URL_REGISTRY: "\n    SELECT identifier, netloc, scheme, name, ext\n    FROM url_registry;\n  ";
    readonly GET_URL_BY_IDENTIFIER: "\n    SELECT netloc, scheme, name, ext\n    FROM url_registry\n    WHERE identifier = $1;\n  ";
    readonly GET_VARIANTS_BY_IDENTIFIER: "\n    SELECT variant\n    FROM url_variants\n    WHERE identifier = $1;\n  ";
    readonly GET_IDENTIFIER_BY_VARIANT: "\n    SELECT identifier\n    FROM url_variants\n    WHERE variant = $1\n    LIMIT 1;\n  ";
    readonly GET_STATE_VALUE: "\n    SELECT value\n    FROM rate_limiter_state\n    WHERE key = $1;\n  ";
    readonly GET_ALL_STATE: "\n    SELECT key, value\n    FROM rate_limiter_state;\n  ";
    readonly GET_LAST_MB: "\n    SELECT last_mb\n    FROM last_mb_tracking\n    WHERE netloc = $1 AND method = $2;\n  ";
    readonly GET_ALL_LAST_MB_FOR_NETLOC: "\n    SELECT method, last_mb\n    FROM last_mb_tracking\n    WHERE netloc = $1;\n  ";
    readonly PRUNE_OLD_EVENTS: "\n    DELETE FROM rate_events\n    WHERE time < $1;\n  ";
    readonly CLEAR_EXPIRED_COOLDOWNS: "\n    DELETE FROM cooldowns\n    WHERE until <= $1;\n  ";
    readonly CLEAR_URL_VARIANTS: "\n    DELETE FROM url_variants\n    WHERE identifier = $1;\n  ";
};
export type QueryKey = keyof typeof QueryRegistry;
export type Query = typeof QueryRegistry[QueryKey];
