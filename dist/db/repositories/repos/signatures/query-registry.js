/**
 * SIGNATURES QUERY REGISTRY
 *
 * Centralized SQL query definitions.
 * Tracks signature history and processing cursors per account.
 */
// ============================================================
// QUERY REGISTRY (Single source of truth)
// ============================================================
export const QueryRegistry = {
    // ────────────────────────────────────────────────────────
    // SCHEMA
    // ────────────────────────────────────────────────────────
    CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS signatures (
      account TEXT PRIMARY KEY,
      signatures JSONB NOT NULL DEFAULT '[]',
      processed_until TEXT,
      discovery_complete BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
    CREATE_INDEXES: [
        'CREATE INDEX IF NOT EXISTS idx_signatures_account ON signatures(account);',
        'CREATE INDEX IF NOT EXISTS idx_signatures_processed_until ON signatures(processed_until);',
    ],
    // ────────────────────────────────────────────────────────
    // UPSERT
    // ────────────────────────────────────────────────────────
    UPSERT_SIGNATURES: `
    INSERT INTO signatures (account, signatures)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (account)
    DO UPDATE SET
      signatures = EXCLUDED.signatures,
      updated_at = CURRENT_TIMESTAMP;
  `,
    ENSURE_ACCOUNT: `
  INSERT INTO signatures (account, signatures)
  VALUES ($1, '[]'::jsonb)
  ON CONFLICT (account) DO NOTHING;
  `,
    // ────────────────────────────────────────────────────────
    // UPDATE
    // ────────────────────────────────────────────────────────
    UPDATE_PROCESSED_UNTIL: `
    UPDATE signatures
    SET processed_until = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE account = $1;
  `,
    UPDATE_DISCOVERY_COMPLETE: `UPDATE signatures
    SET discovery_complete = TRUE
    WHERE account = $1;`,
    UPDATE_DISCOVERY_INCOMPLETE: `UPDATE signatures
    SET discovery_complete = FALSE
    WHERE account = $1;`,
    // ────────────────────────────────────────────────────────
    // SELECT
    // ────────────────────────────────────────────────────────
    FETCH_BY_ACCOUNT: `
    SELECT * FROM signatures
    WHERE account = $1;
  `,
    VERIFY_INSERT: `
    SELECT signatures
    FROM signatures
    WHERE account = $1;
  `,
};
