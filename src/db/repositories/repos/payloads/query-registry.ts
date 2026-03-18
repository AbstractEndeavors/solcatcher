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

export const QueryRegistry = {
  // ────────────────────────────────────────────────────────
  // SCHEMA
  // ────────────────────────────────────────────────────────

  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS log_payloads (
      id BIGSERIAL PRIMARY KEY,

      -- identity
      signature TEXT NOT NULL,
      program_id TEXT NOT NULL,
      discriminator TEXT NOT NULL,

      -- semantics
      event TEXT,
      payload_len INT NOT NULL,

      -- execution context
      depth INT NOT NULL,
      invocation_index INT NOT NULL,
      reported_invocation INT,

      -- raw
      b64 TEXT NOT NULL,

      -- decoded
      decoded_data JSONB,
      decodable BOOLEAN,

      -- lineage
      parent_program_id TEXT,
      parent_event TEXT,

      -- processing state
      failed BOOLEAN DEFAULT NULL,
      processed BOOLEAN NOT NULL DEFAULT FALSE,
      processed_at TIMESTAMPTZ,

      -- timestamps
      decoded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  CREATE_UNKNOWN_INSTRUCTIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS unknown_instructions (
      id BIGSERIAL PRIMARY KEY,
      signature TEXT NOT NULL,
      program_id TEXT NOT NULL,
      invocation_index INT NOT NULL,
      discriminator TEXT NOT NULL,
      data_prefix TEXT,
      reason TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,

  CREATE_INDEXES: [
    `CREATE INDEX IF NOT EXISTS idx_log_payloads_discriminator
      ON log_payloads (discriminator);`,

    `CREATE INDEX IF NOT EXISTS idx_log_payloads_program
      ON log_payloads (program_id);`,

    `CREATE INDEX IF NOT EXISTS idx_log_payloads_event
      ON log_payloads (event);`,

    `CREATE INDEX IF NOT EXISTS idx_log_payloads_signature
      ON log_payloads (signature);`,

    `CREATE INDEX IF NOT EXISTS idx_log_payloads_disc_program
      ON log_payloads (discriminator, program_id);`,

    `CREATE INDEX IF NOT EXISTS idx_log_payloads_disc_payload
      ON log_payloads (discriminator, payload_len);`,

    `CREATE INDEX IF NOT EXISTS idx_log_payloads_processed
      ON log_payloads (processed) WHERE processed = FALSE;`,

    `CREATE UNIQUE INDEX IF NOT EXISTS idx_log_payloads_unique
      ON log_payloads (signature, invocation_index, discriminator);`,

    `CREATE INDEX IF NOT EXISTS idx_unknown_instructions_discriminator
      ON unknown_instructions (discriminator);`,

    `CREATE INDEX IF NOT EXISTS idx_unknown_instructions_program
      ON unknown_instructions (program_id);`,
  ] as const,

  // ────────────────────────────────────────────────────────
  // INSERT
  // ────────────────────────────────────────────────────────

  INSERT_BATCH: `
    INSERT INTO log_payloads (
      signature,
      program_id,
      discriminator,
      payload_len,
      event,
      depth,
      invocation_index,
      reported_invocation,
      parent_program_id,
      parent_event,
      b64,
      decodable
    )
    SELECT * FROM json_to_recordset($1::json)
    AS t(
      signature TEXT,
      program_id TEXT,
      discriminator TEXT,
      payload_len INT,
      event TEXT,
      depth INT,
      invocation_index INT,
      reported_invocation INT,
      parent_program_id TEXT,
      parent_event TEXT,
      b64 TEXT,
      decodable BOOLEAN
    )
    ON CONFLICT DO NOTHING
    RETURNING id, signature, program_id;
  `,

  INSERT_UNKNOWN_INSTRUCTION: `
    INSERT INTO unknown_instructions
      (signature, program_id, invocation_index, discriminator, data_prefix, reason)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT DO NOTHING;
  `,

  // ────────────────────────────────────────────────────────
  // SELECT
  // ────────────────────────────────────────────────────────

  FETCH_BY_ID: `
    SELECT * FROM log_payloads
    WHERE id = $1
    LIMIT 1;
  `,

  FETCH_BY_SIGNATURE: `
    SELECT * FROM log_payloads
    WHERE signature = $1
    ORDER BY invocation_index;
  `,
FETCH_BY_IDS: `
SELECT *
FROM log_payloads
WHERE id = ANY($1::bigint[])
ORDER BY array_position($1::bigint[], id);
 `,

  // ────────────────────────────────────────────────────────
  // BY DISCRIMINATOR
  //   $1 = discriminator, $2 = limit
  // ────────────────────────────────────────────────────────

  FETCH_BY_DISCRIMINATOR_OLDEST: `
    SELECT *
    FROM log_payloads
    WHERE discriminator = $1
    ORDER BY created_at ASC
    LIMIT $2;
  `,

  FETCH_BY_DISCRIMINATOR_LATEST: `
    SELECT *
    FROM log_payloads
    WHERE discriminator = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `,

  FETCH_BY_DISCRIMINATOR_OLDEST_NO_LIMIT: `
    SELECT *
    FROM log_payloads
    WHERE discriminator = $1
    ORDER BY created_at ASC;
  `,

  FETCH_BY_DISCRIMINATOR_LATEST_NO_LIMIT: `
    SELECT *
    FROM log_payloads
    WHERE discriminator = $1
    ORDER BY created_at DESC;
  `,

  // ────────────────────────────────────────────────────────
  // UNPROCESSED
  //   $1 = limit
  // ────────────────────────────────────────────────────────

  FETCH_UNPROCESSED_OLDEST: `
    SELECT *
    FROM log_payloads
    WHERE processed = FALSE
    ORDER BY created_at ASC
    LIMIT $1;
  `,

  FETCH_UNPROCESSED_LATEST: `
    SELECT *
    FROM log_payloads
    WHERE processed = FALSE
    ORDER BY created_at DESC
    LIMIT $1;
  `,

  FETCH_UNPROCESSED_OLDEST_NO_LIMIT: `
    SELECT *
    FROM log_payloads
    WHERE processed = FALSE
    ORDER BY created_at ASC;
  `,

  FETCH_UNPROCESSED_LATEST_NO_LIMIT: `
    SELECT *
    FROM log_payloads
    WHERE processed = FALSE
    ORDER BY created_at DESC;
  `,

  // ────────────────────────────────────────────────────────
  // BY LIMIT (all rows, no filter)
  //   $1 = limit
  // ────────────────────────────────────────────────────────

  FETCH_BY_LIMIT_OLDEST: `
    SELECT *
    FROM log_payloads
    ORDER BY created_at ASC
    LIMIT $1;
  `,

  FETCH_BY_LIMIT_LATEST: `
    SELECT *
    FROM log_payloads
    ORDER BY created_at DESC
    LIMIT $1;
  `,

  FETCH_OLDEST_NO_LIMIT: `
    SELECT *
    FROM log_payloads
    ORDER BY created_at ASC;
  `,

  FETCH_LATEST_NO_LIMIT: `
    SELECT *
    FROM log_payloads
    ORDER BY created_at DESC;
  `,

  // ────────────────────────────────────────────────────────
  // SINGLE ROW
  // ────────────────────────────────────────────────────────

  FETCH_OLDEST: `
    SELECT *
    FROM log_payloads
    ORDER BY created_at ASC
    LIMIT 1;
  `,

  FETCH_LATEST: `
    SELECT *
    FROM log_payloads
    ORDER BY created_at DESC
    LIMIT 1;
  `,

  // ────────────────────────────────────────────────────────
  // UPDATE  (all return the updated row)
  // ────────────────────────────────────────────────────────

  MARK_PROCESSED: `
    UPDATE log_payloads
    SET processed = TRUE,
        processed_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,

  MARK_FAILED: `
    UPDATE log_payloads
    SET failed = TRUE,
        processed = TRUE,
        processed_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,

  SET_DECODED_DATA: `
    UPDATE log_payloads
    SET decoded_data = $2,
        decoded_at = NOW()
    WHERE id = $1
    RETURNING decoded_data;
  `,

  SET_DECODABLE: `
    UPDATE log_payloads
    SET decodable = TRUE
    WHERE id = $1
    RETURNING *;
  `,

  SET_UNDECODABLE: `
    UPDATE log_payloads
    SET decodable = FALSE
    WHERE id = $1
    RETURNING *;
  `,

  // ────────────────────────────────────────────────────────
  // ANALYTICS
  // ────────────────────────────────────────────────────────

  FETCH_DISCRIMINATOR_EVENTS: `
    SELECT
      discriminator,
      ARRAY_AGG(DISTINCT event) AS events
    FROM log_payloads
    GROUP BY discriminator;
  `,

  FETCH_DISCRIMINATOR_VERSIONS: `
    SELECT
      discriminator,
      COUNT(DISTINCT payload_len) AS versions
    FROM log_payloads
    GROUP BY discriminator
    HAVING COUNT(DISTINCT payload_len) > 1;
  `,

  FETCH_DISCRIMINATOR_PROGRAM_FREQUENCY: `
    SELECT
      discriminator,
      program_id,
      COUNT(*) AS seen
    FROM log_payloads
    GROUP BY discriminator, program_id;
  `,

  COUNT_BY_PROGRAM: `
    SELECT program_id, COUNT(*) as count
    FROM log_payloads
    GROUP BY program_id
    ORDER BY count DESC;
  `,

  COUNT_UNPROCESSED: `
    SELECT COUNT(*) as count
    FROM log_payloads
    WHERE processed = FALSE;
  `,
} as const;

// ============================================================
// TYPE-SAFE QUERY KEYS
// ============================================================

export type QueryKey = keyof typeof QueryRegistry;
export type Query = (typeof QueryRegistry)[QueryKey];
