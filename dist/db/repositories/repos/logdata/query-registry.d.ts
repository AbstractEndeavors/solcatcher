/**
 * QUERY REGISTRY
 *
 * Centralized SQL query definitions.
 * No string interpolation, no runtime construction.
 * All queries are statically defined here.
 */
export declare const QueryRegistry: {
    readonly CREATE_TABLE: "\n    CREATE TABLE IF NOT EXISTS logdata (\n    id SERIAL PRIMARY KEY,\n    signature TEXT UNIQUE,\n    slot INTEGER,\n    program_id TEXT,\n    signatures TEXT[] DEFAULT NULL,\n    logs_b64 TEXT NOT NULL,\n    intake_at  TIMESTAMPTZ NOT NULL DEFAULT now(),\n\n    parsed_logs JSONB DEFAULT NULL,\n    parsed BOOLEAN DEFAULT FALSE,\n    parsed_at TIMESTAMP DEFAULT NULL,\n\n    pair_id INTEGER DEFAULT NULL,\n    txn_id INTEGER DEFAULT NULL,\n    meta_id INTEGER DEFAULT NULL,\n    sorted BOOLEAN DEFAULT FALSE,\n    sorted_at TIMESTAMP DEFAULT NULL,\n\n    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n  );\n   ";
    readonly CREATE_INDEXES: readonly ["CREATE INDEX IF NOT EXISTS idx_logdata_signature ON logdata(signature);", "CREATE INDEX IF NOT EXISTS idx_logdata_sorted ON logdata(sorted);", "CREATE INDEX IF NOT EXISTS idx_logdata_program_id ON logdata(program_id);"];
    readonly INSERT_INTENT: "\n  INSERT INTO logdata (signature)\n  VALUES ($1)\n  ON CONFLICT (signature) DO UPDATE\n    SET signature = EXCLUDED.signature\n  RETURNING id;\n";
    readonly INSERT: "\n  INSERT INTO logdata (signature, slot, program_id, logs_b64, signatures)\n  VALUES ($1, $2, $3, $4, $5)\n  ON CONFLICT (signature) DO UPDATE SET\n    slot = EXCLUDED.slot,\n    program_id = EXCLUDED.program_id,\n    \n    signatures = COALESCE(EXCLUDED.signatures, logdata.signatures),\n    intake_at = NOW(),\n    logs_b64 = CASE\n  WHEN logdata.parsed_logs IS NULL THEN EXCLUDED.logs_b64\n  ELSE logdata.logs_b64\n  END\n  RETURNING id;\n";
    readonly BATCH_INSERT: "\n    INSERT INTO logdata (signature, slot, program_id, logs_b64, signatures)\n    SELECT signature, slot, program_id, logs_b64, signatures\n    FROM UNNEST(\n      $1::text[],\n      $2::int[],\n      $3::text[],\n      $4::text[],\n      COALESCE($5::text[][], ARRAY[]::text[][])\n    ) AS t(signature, slot, program_id, logs_b64, signatures)\n    ON CONFLICT (signature) DO UPDATE SET\n      slot = EXCLUDED.slot,\n      program_id = EXCLUDED.program_id,\n      logs_b64 = EXCLUDED.logs_b64,\n      signatures = COALESCE(EXCLUDED.signatures, logdata.signatures),\n      intake_at = NOW()\n    RETURNING id, signature;\n  ";
    readonly UPDATE: "\n    UPDATE logdata SET\n      program_id = COALESCE($2, program_id),\n      pair_id    = COALESCE($3, pair_id),\n      txn_id     = COALESCE($4, txn_id),\n      signatures = COALESCE($5, signatures),\n      updated_at = NOW()\n    WHERE signature = $1\n    RETURNING *;\n  ";
    readonly UPSERT_PARSED_LOGS_BY_ID: "\n    UPDATE logdata SET \n      parsed_logs = $2::jsonb,\n      parsed = TRUE,\n      parsed_at = NOW(),\n      updated_at = NOW()\n    WHERE id = $1\n    RETURNING id;\n  ";
    readonly UPSERT_PARSED_LOGS_BY_SIGNATURE: "\n    UPDATE logdata SET \n      parsed_logs = $2::jsonb,\n      parsed = TRUE,\n      parsed_at = NOW(),\n      updated_at = NOW()\n    WHERE signature = $1\n    RETURNING id;\n  ";
    readonly GET_CONTEXT: "\n    SELECT id, signature, program_id, slot \n    FROM logdata\n    WHERE signature = $1;\n    ";
    readonly FETCH_BY_ID: "\n    SELECT * FROM logdata \n    WHERE id = $1 \n    LIMIT 1;\n  ";
    readonly FETCH_BY_SIGNATURE: "\n    SELECT * FROM logdata \n    WHERE signature = $1;\n  ";
    readonly FETCH_SIGNATURES_ONLY_BY_SIGNATURE: "\n    SELECT signatures FROM logdata \n    WHERE signature = $1;\n  ";
    readonly FETCH_SIGNATURES_ONLY_BY_ID: "\n    SELECT signatures FROM logdata \n    WHERE id = $1;\n  ";
    readonly FETCH_SIGNATURES_ONLY_BY_LIMIT: "\n    SELECT signatures FROM logdata\n    ORDER BY created_at\n    LIMIT $1\n  ";
    readonly FETCH_SIGNATURES_ONLY_BY_LIMIT_LATEST: "\n    SELECT signatures\n    FROM logdata\n    ORDER BY created_at DESC, id DESC\n    LIMIT $1\n    FOR UPDATE SKIP LOCKED\n  ";
    readonly FETCH_BY_LIMIT_OLDEST: "\n    SELECT *\n    FROM logdata\n    ORDER BY created_at ASC\n    LIMIT $1\n  ";
    readonly FETCH_BY_LIMIT_LATEST: "\n    SELECT *\n    FROM logdata\n    WHERE sorted = FALSE\n    ORDER BY created_at DESC\n    LIMIT $1\n  ";
    readonly FETCH_OLDEST_NO_LIMIT: "\n    SELECT *\n    FROM logdata\n    WHERE sorted = FALSE\n    ORDER BY created_at ASC\n  ";
    readonly FETCH_LATEST_NO_LIMIT: "\n    SELECT *\n    FROM logdata\n    WHERE sorted = FALSE\n    ORDER BY created_at DESC\n  ";
    readonly FETCH_OLDEST: "\n    SELECT *\n    FROM logdata\n    WHERE sorted = FALSE\n    ORDER BY created_at ASC\n    LIMIT 1\n  ";
    readonly FETCH_LATEST: "\n    SELECT *\n    FROM logdata\n    WHERE sorted = FALSE\n    ORDER BY created_at DESC\n    LIMIT 1\n  ";
    readonly MARK_PROCESSED_BY_ID: "\n    UPDATE logdata\n    SET\n      parsed = TRUE,\n      parsed_at = NOW(),\n      updated_at   = CURRENT_TIMESTAMP\n    WHERE id = $1\n    RETURNING id;\n  ";
    readonly MARK_PROCESSED_BY_SIGNATURE: "\n    UPDATE logdata\n    SET\n      parsed = TRUE,\n      parsed_at = NOW(),\n      updated_at   = CURRENT_TIMESTAMP\n    WHERE signature = $1\n    RETURNING id;\n  ";
    readonly MARK_PROCESSED_BATCH_BY_ID: "\n    UPDATE logdata\n    SET\n      parsed = TRUE,\n      parsed_at = NOW(),\n      updated_at   = CURRENT_TIMESTAMP\n    WHERE id = ANY($1::int[])\n    RETURNING id;\n  ";
    readonly MARK_PROCESSED_BATCH_BY_SIGNATURE: "\n    UPDATE logdata\n    SET\n      parsed = TRUE,\n      parsed_at = NOW(),\n      updated_at   = CURRENT_TIMESTAMP\n\n    WHERE signature = ANY($1::text[])\n    RETURNING id;\n  ";
    readonly MARK_SORTED_BY_SIGNATURE: "\n    UPDATE logdata\n    SET\n      sorted     = TRUE,\n      sorted_at  = NOW(),\n      updated_at = NOW(),\n\n      meta_id = COALESCE($2, meta_id),\n      pair_id = COALESCE($3, pair_id),\n      txn_id  = COALESCE($4, txn_id)\n    WHERE signature = $1\n      AND sorted IS FALSE\n    RETURNING id;\n  ";
    readonly MARK_SORTED_BY_ID: "\n    UPDATE logdata\n    SET\n      sorted     = TRUE,\n      sorted_at  = NOW(),\n      updated_at = NOW(),\n\n      meta_id = COALESCE($2, meta_id),\n      pair_id = COALESCE($3, pair_id),\n      txn_id  = COALESCE($4, txn_id)\n    WHERE id = $1\n      AND sorted IS FALSE\n    RETURNING id;\n\n  ";
    readonly MARK_SORTED_BATCH_BY_SIGNATURE: "\n    UPDATE logdata\n    SET\n      sorted     = TRUE,\n      sorted_at  = NOW(),\n      updated_at = NOW(),\n\n      meta_id = COALESCE($2, meta_id),\n      pair_id = COALESCE($3, pair_id),\n      txn_id  = COALESCE($4, txn_id)\n    WHERE signature = ANY($1::text[])\n      AND sorted IS FALSE\n    RETURNING id;\n  ";
    readonly MARK_SORTED_BATCH_BY_ID: "\n    UPDATE logdata\n    SET\n      sorted     = TRUE,\n      sorted_at  = NOW(),\n      updated_at = CURRENT_TIMESTAMP,\n\n      meta_id = COALESCE($2, meta_id),\n      pair_id = COALESCE($3, pair_id),\n      txn_id  = COALESCE($4, txn_id)\n\n    WHERE id = ANY($1::int[])\n      AND sorted IS FALSE\n    RETURNING id;\n  ";
};
export type QueryKey = keyof typeof QueryRegistry;
export type Query = typeof QueryRegistry[QueryKey];
