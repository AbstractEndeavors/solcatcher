/**
 * QUERY REGISTRY
 * 
 * Centralized SQL query definitions.
 * No string interpolation, no runtime construction.
 * All queries are statically defined here.
 */

// ============================================================
// QUERY REGISTRY (Single source of truth)
// ============================================================

export const QueryRegistry = {
  // ────────────────────────────────────────────────────────
  // SCHEMA
  // ────────────────────────────────────────────────────────
  
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS logdata (
    id SERIAL PRIMARY KEY,
    signature TEXT UNIQUE,
    slot INTEGER,
    program_id TEXT,
    signatures TEXT[] DEFAULT NULL,
    logs_b64 TEXT NOT NULL,
    intake_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    parsed_logs JSONB DEFAULT NULL,
    parsed BOOLEAN DEFAULT FALSE,
    parsed_at TIMESTAMP DEFAULT NULL,

    pair_id INTEGER DEFAULT NULL,
    txn_id INTEGER DEFAULT NULL,
    meta_id INTEGER DEFAULT NULL,
    sorted BOOLEAN DEFAULT FALSE,
    sorted_at TIMESTAMP DEFAULT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
   `,CREATE_INDEXES: [
    'CREATE INDEX IF NOT EXISTS idx_logdata_signature ON logdata(signature);',
    'CREATE INDEX IF NOT EXISTS idx_logdata_sorted ON logdata(sorted);',
    'CREATE INDEX IF NOT EXISTS idx_logdata_program_id ON logdata(program_id);',
    ] as const,

  // ────────────────────────────────────────────────────────
  // INSERT/UPSERT
  // ────────────────────────────────────────────────────────

  INSERT_INTENT: `
  INSERT INTO logdata (signature)
  VALUES ($1)
  ON CONFLICT (signature) DO UPDATE
    SET signature = EXCLUDED.signature
  RETURNING id;
`,INSERT: `
  INSERT INTO logdata (signature, slot, program_id, logs_b64, signatures)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (signature) DO UPDATE SET
    slot = EXCLUDED.slot,
    program_id = EXCLUDED.program_id,
    
    signatures = COALESCE(EXCLUDED.signatures, logdata.signatures),
    intake_at = NOW(),
    logs_b64 = CASE
  WHEN logdata.parsed_logs IS NULL THEN EXCLUDED.logs_b64
  ELSE logdata.logs_b64
  END
  RETURNING id;
`,
  // ────────────────────────────────────────────────────────
  // BATCH INSERT/UPSERT
  // ────────────────────────────────────────────────────────

  BATCH_INSERT: `
    INSERT INTO logdata (signature, slot, program_id, logs_b64, signatures)
    SELECT signature, slot, program_id, logs_b64, signatures
    FROM UNNEST(
      $1::text[],
      $2::int[],
      $3::text[],
      $4::text[],
      COALESCE($5::text[][], ARRAY[]::text[][])
    ) AS t(signature, slot, program_id, logs_b64, signatures)
    ON CONFLICT (signature) DO UPDATE SET
      slot = EXCLUDED.slot,
      program_id = EXCLUDED.program_id,
      logs_b64 = EXCLUDED.logs_b64,
      signatures = COALESCE(EXCLUDED.signatures, logdata.signatures),
      intake_at = NOW()
    RETURNING id, signature;
  `,


  // ────────────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────────────

  UPDATE: `
    UPDATE logdata SET
      program_id = COALESCE($2, program_id),
      pair_id    = COALESCE($3, pair_id),
      txn_id     = COALESCE($4, txn_id),
      signatures = COALESCE($5, signatures),
      updated_at = NOW()
    WHERE signature = $1
    RETURNING *;
  `,UPSERT_PARSED_LOGS_BY_ID: `
    UPDATE logdata SET 
      parsed_logs = $2::jsonb,
      parsed = TRUE,
      parsed_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING id;
  `,UPSERT_PARSED_LOGS_BY_SIGNATURE: `
    UPDATE logdata SET 
      parsed_logs = $2::jsonb,
      parsed = TRUE,
      parsed_at = NOW(),
      updated_at = NOW()
    WHERE signature = $1
    RETURNING id;
  `,
  // ────────────────────────────────────────────────────────
  // SELECT
  // ────────────────────────────────────────────────────────
  GET_CONTEXT: `
    SELECT id, signature, program_id, slot 
    FROM logdata
    WHERE signature = $1;
    `,

  // ────────────────────────────────────────────────────────
  // SELECT
  // ────────────────────────────────────────────────────────
  FETCH_BY_ID: `
    SELECT * FROM logdata 
    WHERE id = $1 
    LIMIT 1;
  `,FETCH_BY_SIGNATURE: `
    SELECT * FROM logdata 
    WHERE signature = $1;
  `
  // ────────────────────────────────────────────────────────
  // SIGNATURE
  // ────────────────────────────────────────────────────────
  ,FETCH_SIGNATURES_ONLY_BY_SIGNATURE: `
    SELECT signatures FROM logdata 
    WHERE signature = $1;
  `,FETCH_SIGNATURES_ONLY_BY_ID: `
    SELECT signatures FROM logdata 
    WHERE id = $1;
  `,FETCH_SIGNATURES_ONLY_BY_LIMIT: `
    SELECT signatures FROM logdata
    ORDER BY created_at
    LIMIT $1
  `,FETCH_SIGNATURES_ONLY_BY_LIMIT_LATEST: `
    SELECT signatures
    FROM logdata
    ORDER BY created_at DESC, id DESC
    LIMIT $1
    FOR UPDATE SKIP LOCKED
  `,
  // ────────────────────────────────────────────────────────
  // LIMIT
  // ──────────────────────────────────────────────────────── 
  FETCH_BY_LIMIT_OLDEST: `
    SELECT *
    FROM logdata
    ORDER BY created_at ASC
    LIMIT $1
  `,FETCH_BY_LIMIT_LATEST: `
    SELECT *
    FROM logdata
    WHERE sorted = FALSE
    ORDER BY created_at DESC
    LIMIT $1
  `,FETCH_OLDEST_NO_LIMIT: `
    SELECT *
    FROM logdata
    WHERE sorted = FALSE
    ORDER BY created_at ASC
  `,FETCH_LATEST_NO_LIMIT: `
    SELECT *
    FROM logdata
    WHERE sorted = FALSE
    ORDER BY created_at DESC
  `,

  // ────────────────────────────────────────────────────────
  // SINGLE
  // ──────────────────────────────────────────────────────── 
  FETCH_OLDEST: `
    SELECT *
    FROM logdata
    WHERE sorted = FALSE
    ORDER BY created_at ASC
    LIMIT 1
  `,FETCH_LATEST: `
    SELECT *
    FROM logdata
    WHERE sorted = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `,
  // ────────────────────────────────────────────────────────
  // MARK parsed - log-parsed
  // ────────────────────────────────────────────────────────
  MARK_PROCESSED_BY_ID: `
    UPDATE logdata
    SET
      parsed = TRUE,
      parsed_at = NOW(),
      updated_at   = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id;
  `,MARK_PROCESSED_BY_SIGNATURE: `
    UPDATE logdata
    SET
      parsed = TRUE,
      parsed_at = NOW(),
      updated_at   = CURRENT_TIMESTAMP
    WHERE signature = $1
    RETURNING id;
  `,
  // ────────────────────────────────────────────────────────
  // MARK BATCH parsed - log-parsed
  // ────────────────────────────────────────────────────────
  MARK_PROCESSED_BATCH_BY_ID: `
    UPDATE logdata
    SET
      parsed = TRUE,
      parsed_at = NOW(),
      updated_at   = CURRENT_TIMESTAMP
    WHERE id = ANY($1::int[])
    RETURNING id;
  `,MARK_PROCESSED_BATCH_BY_SIGNATURE: `
    UPDATE logdata
    SET
      parsed = TRUE,
      parsed_at = NOW(),
      updated_at   = CURRENT_TIMESTAMP

    WHERE signature = ANY($1::text[])
    RETURNING id;
  `,

  // ────────────────────────────────────────────────────────
  // MARK SORTED
  // ────────────────────────────────────────────────────────
  MARK_SORTED_BY_SIGNATURE: `
    UPDATE logdata
    SET
      sorted     = TRUE,
      sorted_at  = NOW(),
      updated_at = NOW(),

      meta_id = COALESCE($2, meta_id),
      pair_id = COALESCE($3, pair_id),
      txn_id  = COALESCE($4, txn_id)
    WHERE signature = $1
      AND sorted IS FALSE
    RETURNING id;
  `,MARK_SORTED_BY_ID: `
    UPDATE logdata
    SET
      sorted     = TRUE,
      sorted_at  = NOW(),
      updated_at = NOW(),

      meta_id = COALESCE($2, meta_id),
      pair_id = COALESCE($3, pair_id),
      txn_id  = COALESCE($4, txn_id)
    WHERE id = $1
      AND sorted IS FALSE
    RETURNING id;

  `,
  // ────────────────────────────────────────────────────────
  // MARK BATCH SORTED
  // ────────────────────────────────────────────────────────
  MARK_SORTED_BATCH_BY_SIGNATURE: `
    UPDATE logdata
    SET
      sorted     = TRUE,
      sorted_at  = NOW(),
      updated_at = NOW(),

      meta_id = COALESCE($2, meta_id),
      pair_id = COALESCE($3, pair_id),
      txn_id  = COALESCE($4, txn_id)
    WHERE signature = ANY($1::text[])
      AND sorted IS FALSE
    RETURNING id;
  `,MARK_SORTED_BATCH_BY_ID: `
    UPDATE logdata
    SET
      sorted     = TRUE,
      sorted_at  = NOW(),
      updated_at = CURRENT_TIMESTAMP,

      meta_id = COALESCE($2, meta_id),
      pair_id = COALESCE($3, pair_id),
      txn_id  = COALESCE($4, txn_id)

    WHERE id = ANY($1::int[])
      AND sorted IS FALSE
    RETURNING id;
  `,



} as const;

// ============================================================
// TYPE-SAFE QUERY KEYS
// ============================================================

export type QueryKey = keyof typeof QueryRegistry;
export type Query = typeof QueryRegistry[QueryKey];
