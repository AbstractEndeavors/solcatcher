/**
 * LOG PAYLOADS QUERY REGISTRY
 *
 * Centralized SQL query definitions.
 * No string interpolation, no runtime construction.
 * All queries are statically defined here.
 *
 * FIXES APPLIED:
 *   - SET_DECODEABLE / SET_UNDECODEABLE: names unswapped, single assignment, no phantom $2
 *   - FETCH_BY_DISCRIMINATOR_*: WHERE before ORDER BY, $1/$2 not reused
 *   - FETCH_UNPROCESSED_OLDEST: WHERE before ORDER BY
 *   - FETCH_BY_LIMIT_*: removed references to nonexistent `sorted` column
 *   - FETCH_OLDEST / FETCH_LATEST: removed `sorted`, fixed sort direction
 *   - All UPDATE queries: added RETURNING * so callers get the row back
 */
export declare const QueryRegistry: {
    readonly CREATE_TABLE: "\n    CREATE TABLE IF NOT EXISTS log_payloads (\n      id BIGSERIAL PRIMARY KEY,\n\n      -- identity\n      signature TEXT NOT NULL,\n      program_id TEXT NOT NULL,\n      discriminator TEXT NOT NULL,\n\n      -- semantics\n      event TEXT,\n      payload_len INT NOT NULL,\n\n      -- execution context\n      depth INT NOT NULL,\n      invocation_index INT NOT NULL,\n      reported_invocation INT,\n\n      -- raw\n      b64 TEXT NOT NULL,\n\n      -- decoded\n      decoded_data JSONB,\n      decodable BOOLEAN,\n\n      -- lineage\n      parent_program_id TEXT,\n      parent_event TEXT,\n\n      -- processing state\n      failed BOOLEAN DEFAULT NULL,\n      processed BOOLEAN NOT NULL DEFAULT FALSE,\n      processed_at TIMESTAMPTZ,\n\n      -- timestamps\n      decoded_at TIMESTAMPTZ,\n      created_at TIMESTAMPTZ DEFAULT NOW()\n    );\n  ";
    readonly CREATE_UNKNOWN_INSTRUCTIONS_TABLE: "\n    CREATE TABLE IF NOT EXISTS unknown_instructions (\n      id BIGSERIAL PRIMARY KEY,\n      signature TEXT NOT NULL,\n      program_id TEXT NOT NULL,\n      invocation_index INT NOT NULL,\n      discriminator TEXT NOT NULL,\n      data_prefix TEXT,\n      reason TEXT NOT NULL,\n      created_at TIMESTAMPTZ DEFAULT NOW()\n    );\n  ";
    readonly CREATE_INDEXES: readonly ["CREATE INDEX IF NOT EXISTS idx_log_payloads_discriminator\n      ON log_payloads (discriminator);", "CREATE INDEX IF NOT EXISTS idx_log_payloads_program\n      ON log_payloads (program_id);", "CREATE INDEX IF NOT EXISTS idx_log_payloads_event\n      ON log_payloads (event);", "CREATE INDEX IF NOT EXISTS idx_log_payloads_signature\n      ON log_payloads (signature);", "CREATE INDEX IF NOT EXISTS idx_log_payloads_disc_program\n      ON log_payloads (discriminator, program_id);", "CREATE INDEX IF NOT EXISTS idx_log_payloads_disc_payload\n      ON log_payloads (discriminator, payload_len);", "CREATE INDEX IF NOT EXISTS idx_log_payloads_processed\n      ON log_payloads (processed) WHERE processed = FALSE;", "CREATE UNIQUE INDEX IF NOT EXISTS idx_log_payloads_unique\n      ON log_payloads (signature, invocation_index, discriminator);", "CREATE INDEX IF NOT EXISTS idx_unknown_instructions_discriminator\n      ON unknown_instructions (discriminator);", "CREATE INDEX IF NOT EXISTS idx_unknown_instructions_program\n      ON unknown_instructions (program_id);"];
    readonly INSERT_BATCH: "\n    INSERT INTO log_payloads (\n      signature,\n      program_id,\n      discriminator,\n      payload_len,\n      event,\n      depth,\n      invocation_index,\n      reported_invocation,\n      parent_program_id,\n      parent_event,\n      b64,\n      decodable\n    )\n    SELECT * FROM json_to_recordset($1::json)\n    AS t(\n      signature TEXT,\n      program_id TEXT,\n      discriminator TEXT,\n      payload_len INT,\n      event TEXT,\n      depth INT,\n      invocation_index INT,\n      reported_invocation INT,\n      parent_program_id TEXT,\n      parent_event TEXT,\n      b64 TEXT,\n      decodable BOOLEAN\n    )\n    ON CONFLICT DO NOTHING\n    RETURNING id, signature, program_id;\n  ";
    readonly INSERT_UNKNOWN_INSTRUCTION: "\n    INSERT INTO unknown_instructions\n      (signature, program_id, invocation_index, discriminator, data_prefix, reason)\n    VALUES ($1, $2, $3, $4, $5, $6)\n    ON CONFLICT DO NOTHING;\n  ";
    readonly FETCH_BY_ID: "\n    SELECT * FROM log_payloads\n    WHERE id = $1\n    LIMIT 1;\n  ";
    readonly FETCH_BY_SIGNATURE: "\n    SELECT * FROM log_payloads\n    WHERE signature = $1\n    ORDER BY invocation_index;\n  ";
    readonly FETCH_BY_IDS: "\nSELECT *\nFROM log_payloads\nWHERE id = ANY($1::bigint[])\nORDER BY array_position($1::bigint[], id);\n ";
    readonly FETCH_BY_DISCRIMINATOR_OLDEST: "\n    SELECT *\n    FROM log_payloads\n    WHERE discriminator = $1\n    ORDER BY created_at ASC\n    LIMIT $2;\n  ";
    readonly FETCH_BY_DISCRIMINATOR_LATEST: "\n    SELECT *\n    FROM log_payloads\n    WHERE discriminator = $1\n    ORDER BY created_at DESC\n    LIMIT $2;\n  ";
    readonly FETCH_BY_DISCRIMINATOR_OLDEST_NO_LIMIT: "\n    SELECT *\n    FROM log_payloads\n    WHERE discriminator = $1\n    ORDER BY created_at ASC;\n  ";
    readonly FETCH_BY_DISCRIMINATOR_LATEST_NO_LIMIT: "\n    SELECT *\n    FROM log_payloads\n    WHERE discriminator = $1\n    ORDER BY created_at DESC;\n  ";
    readonly FETCH_UNPROCESSED_OLDEST: "\n    SELECT *\n    FROM log_payloads\n    WHERE processed = FALSE\n    ORDER BY created_at ASC\n    LIMIT $1;\n  ";
    readonly FETCH_UNPROCESSED_LATEST: "\n    SELECT *\n    FROM log_payloads\n    WHERE processed = FALSE\n    ORDER BY created_at DESC\n    LIMIT $1;\n  ";
    readonly FETCH_UNPROCESSED_OLDEST_NO_LIMIT: "\n    SELECT *\n    FROM log_payloads\n    WHERE processed = FALSE\n    ORDER BY created_at ASC;\n  ";
    readonly FETCH_UNPROCESSED_LATEST_NO_LIMIT: "\n    SELECT *\n    FROM log_payloads\n    WHERE processed = FALSE\n    ORDER BY created_at DESC;\n  ";
    readonly FETCH_BY_LIMIT_OLDEST: "\n    SELECT *\n    FROM log_payloads\n    ORDER BY created_at ASC\n    LIMIT $1;\n  ";
    readonly FETCH_BY_LIMIT_LATEST: "\n    SELECT *\n    FROM log_payloads\n    ORDER BY created_at DESC\n    LIMIT $1;\n  ";
    readonly FETCH_OLDEST_NO_LIMIT: "\n    SELECT *\n    FROM log_payloads\n    ORDER BY created_at ASC;\n  ";
    readonly FETCH_LATEST_NO_LIMIT: "\n    SELECT *\n    FROM log_payloads\n    ORDER BY created_at DESC;\n  ";
    readonly FETCH_OLDEST: "\n    SELECT *\n    FROM log_payloads\n    ORDER BY created_at ASC\n    LIMIT 1;\n  ";
    readonly FETCH_LATEST: "\n    SELECT *\n    FROM log_payloads\n    ORDER BY created_at DESC\n    LIMIT 1;\n  ";
    readonly MARK_PROCESSED: "\n    UPDATE log_payloads\n    SET processed = TRUE,\n        processed_at = NOW()\n    WHERE id = $1\n    RETURNING *;\n  ";
    readonly MARK_FAILED: "\n    UPDATE log_payloads\n    SET failed = TRUE,\n        processed = TRUE,\n        processed_at = NOW()\n    WHERE id = $1\n    RETURNING *;\n  ";
    readonly SET_DECODED_DATA: "\n    UPDATE log_payloads\n    SET decoded_data = $2,\n        decoded_at = NOW()\n    WHERE id = $1\n    RETURNING decoded_data;\n  ";
    readonly SET_DECODABLE: "\n    UPDATE log_payloads\n    SET decodable = TRUE\n    WHERE id = $1\n    RETURNING *;\n  ";
    readonly SET_UNDECODABLE: "\n    UPDATE log_payloads\n    SET decodable = FALSE\n    WHERE id = $1\n    RETURNING *;\n  ";
    readonly FETCH_DISCRIMINATOR_EVENTS: "\n    SELECT\n      discriminator,\n      ARRAY_AGG(DISTINCT event) AS events\n    FROM log_payloads\n    GROUP BY discriminator;\n  ";
    readonly FETCH_DISCRIMINATOR_VERSIONS: "\n    SELECT\n      discriminator,\n      COUNT(DISTINCT payload_len) AS versions\n    FROM log_payloads\n    GROUP BY discriminator\n    HAVING COUNT(DISTINCT payload_len) > 1;\n  ";
    readonly FETCH_DISCRIMINATOR_PROGRAM_FREQUENCY: "\n    SELECT\n      discriminator,\n      program_id,\n      COUNT(*) AS seen\n    FROM log_payloads\n    GROUP BY discriminator, program_id;\n  ";
    readonly COUNT_BY_PROGRAM: "\n    SELECT program_id, COUNT(*) as count\n    FROM log_payloads\n    GROUP BY program_id\n    ORDER BY count DESC;\n  ";
    readonly COUNT_UNPROCESSED: "\n    SELECT COUNT(*) as count\n    FROM log_payloads\n    WHERE processed = FALSE;\n  ";
};
export type QueryKey = keyof typeof QueryRegistry;
export type Query = (typeof QueryRegistry)[QueryKey];
