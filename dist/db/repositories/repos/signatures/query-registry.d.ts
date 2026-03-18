/**
 * SIGNATURES QUERY REGISTRY
 *
 * Centralized SQL query definitions.
 * Tracks signature history and processing cursors per account.
 */
export declare const QueryRegistry: {
    readonly CREATE_TABLE: "\n    CREATE TABLE IF NOT EXISTS signatures (\n      account TEXT PRIMARY KEY,\n      signatures JSONB NOT NULL DEFAULT '[]',\n      processed_until TEXT,\n      discovery_complete BOOLEAN NOT NULL DEFAULT FALSE,\n      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n    );\n  ";
    readonly CREATE_INDEXES: readonly ["CREATE INDEX IF NOT EXISTS idx_signatures_account ON signatures(account);", "CREATE INDEX IF NOT EXISTS idx_signatures_processed_until ON signatures(processed_until);"];
    readonly UPSERT_SIGNATURES: "\n    INSERT INTO signatures (account, signatures)\n    VALUES ($1, $2::jsonb)\n    ON CONFLICT (account)\n    DO UPDATE SET\n      signatures = EXCLUDED.signatures,\n      updated_at = CURRENT_TIMESTAMP;\n  ";
    readonly ENSURE_ACCOUNT: "\n  INSERT INTO signatures (account, signatures)\n  VALUES ($1, '[]'::jsonb)\n  ON CONFLICT (account) DO NOTHING;\n  ";
    readonly UPDATE_PROCESSED_UNTIL: "\n    UPDATE signatures\n    SET processed_until = $2,\n        updated_at = CURRENT_TIMESTAMP\n    WHERE account = $1;\n  ";
    readonly UPDATE_DISCOVERY_COMPLETE: "UPDATE signatures\n    SET discovery_complete = TRUE\n    WHERE account = $1;";
    readonly UPDATE_DISCOVERY_INCOMPLETE: "UPDATE signatures\n    SET discovery_complete = FALSE\n    WHERE account = $1;";
    readonly FETCH_BY_ACCOUNT: "\n    SELECT * FROM signatures\n    WHERE account = $1;\n  ";
    readonly VERIFY_INSERT: "\n    SELECT signatures\n    FROM signatures\n    WHERE account = $1;\n  ";
};
export type QueryKey = keyof typeof QueryRegistry;
export type Query = typeof QueryRegistry[QueryKey];
