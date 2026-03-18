// Centralized, parameterized, no string interpolation at callsites.
// Pattern: Registries over globals; schema-first; idempotent DDL.
export const QueryRegistry = {
    // ──────────────────
    // SCHEMA
    // ──────────────────
    CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,

      -- provenance
      log_id INTEGER NOT NULL,
      pair_id INTEGER DEFAULT NULL,
      meta_id INTEGER DEFAULT NULL,

      -- canonical identity
      signature TEXT NOT NULL UNIQUE,

      -- chain context
      program_id TEXT NOT NULL,
      slot INTEGER NOT NULL,
      invocation INTEGER NOT NULL,

      -- asset context
      mint TEXT NOT NULL,
      user_address TEXT NOT NULL,

      -- trade direction
      is_buy BOOLEAN NOT NULL,
      ix_name TEXT NOT NULL,

      -- amounts
      sol_amount NUMERIC NOT NULL,
      token_amount NUMERIC NOT NULL,

      -- AMM state
      virtual_sol_reserves NUMERIC NOT NULL,
      virtual_token_reserves NUMERIC NOT NULL,
      real_sol_reserves BIGINT NOT NULL,
      real_token_reserves BIGINT NOT NULL,
      mayhem_mode BOOLEAN NOT NULL,

      -- pricing
      price NUMERIC NOT NULL,

      -- volume tracking
      track_volume BOOLEAN NOT NULL,
      total_unclaimed_tokens BIGINT NOT NULL,
      total_claimed_tokens BIGINT NOT NULL,
      current_sol_volume BIGINT NOT NULL,

      -- fees
      fee_recipient TEXT NOT NULL,
      fee_basis_points BIGINT NOT NULL,
      fee BIGINT NOT NULL,

      -- creator fees
      creator TEXT NOT NULL,
      creator_fee_basis_points BIGINT NOT NULL,
      creator_fee BIGINT NOT NULL,

      -- time
      timestamp BIGINT NOT NULL,
      last_update_timestamp BIGINT NOT NULL,
      
      -- lifecycle
      processed_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
    CREATE_PAIR_ROLLUPS_TABLE: `
    CREATE TABLE IF NOT EXISTS pair_volume_rollups (
      pair_id INTEGER PRIMARY KEY,
      total_sol_volume BIGINT,
      total_token_volume BIGINT,
      updated_at TIMESTAMPTZ
    );
  `,
    CREATE_TMP_CREATOR_TABLE: `
    CREATE TEMP TABLE IF NOT EXISTS tmp_creator_signatures (
      signature TEXT PRIMARY KEY
    ) ON COMMIT DROP;
  `,
    CORE_INDEXES: [
        `CREATE INDEX IF NOT EXISTS idx_transactions_user_created_at
      ON transactions (user_address, created_at DESC);`,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_signature
      ON transactions (signature);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_pair_created_at
      ON transactions (pair_id, created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_program_id
      ON transactions (program_id);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_created_at_desc
      ON transactions (created_at DESC);`,
    ],
    POTENTIAL_INDEXES: [
        `CREATE INDEX IF NOT EXISTS idx_transactions_volume_tracked
      ON transactions (pair_id, current_sol_volume)
      WHERE track_volume = true;`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_sol_amount
      ON transactions (sol_amount);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_price
      ON transactions (price);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_pair_id
      ON transactions (pair_id);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_mint
      ON transactions (mint);`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_creator
      ON transactions (creator);`,
    ],
    // ──────────────────
    // INSERT (idempotent)
    // ──────────────────
    INSERT_TRANSACTION: `
    INSERT INTO transactions (
      log_id,
      pair_id,
      meta_id,
      signature,
      program_id,
      slot,
      invocation,
      mint,
      user_address,
      is_buy,
      ix_name,
      sol_amount,
      token_amount,
      virtual_sol_reserves,
      virtual_token_reserves,
      real_sol_reserves,
      real_token_reserves,
      mayhem_mode,
      price,
      track_volume,
      total_unclaimed_tokens,
      total_claimed_tokens,
      current_sol_volume,
      fee_recipient,
      fee_basis_points,
      fee,
      creator,
      creator_fee_basis_points,
      creator_fee,
      timestamp,
      last_update_timestamp
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
    )
    ON CONFLICT (signature) DO NOTHING
    RETURNING id;
  `,
    // ──────────────────
    // BULK INSERT (temp table pattern)
    // ──────────────────
    INSERT_TMP_CREATOR_SIGNATURES: `
    INSERT INTO tmp_creator_signatures (signature)
    VALUES ($1)
    ON CONFLICT (signature) DO NOTHING;
  `,
    BULK_INSERT_TMP_CREATOR_SIGNATURES: `
    INSERT INTO tmp_creator_signatures (signature)
    SELECT unnest($1::text[])
    ON CONFLICT (signature) DO NOTHING;
  `,
    // ──────────────────
    // SELECT - by identity
    // ──────────────────
    FETCH_BY_ID: `
    SELECT * FROM transactions
    WHERE id = $1
    LIMIT 1;
  `,
    FETCH_BY_SIGNATURE: `
    SELECT * FROM transactions
    WHERE signature = $1
    LIMIT 1;
  `,
    FETCH_BY_PAIR_ID: `
    SELECT * FROM transactions
    WHERE pair_id = $1
    ORDER BY created_at DESC;
  `,
    FETCH_BY_MINT: `
    SELECT * FROM transactions
    WHERE mint = $1
    ORDER BY created_at DESC;
  `,
    // ──────────────────
    // SELECT - by user
    // ──────────────────
    FETCH_BY_USER: `
    SELECT * FROM transactions
    WHERE user_address = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `,
    FETCH_BY_USER_AND_PAIR: `
    SELECT * FROM transactions
    WHERE user_address = $1
      AND pair_id = $2
    ORDER BY created_at DESC;
  `,
    // ──────────────────
    // SELECT - by creator
    // ──────────────────
    FETCH_BY_CREATOR: `
    SELECT * FROM transactions
    WHERE creator = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `,
    FETCH_CREATOR_ACCOUNT_ID: `
    SELECT DISTINCT creator_account_id
    FROM creator_account_transactions
    WHERE signature IN (SELECT signature FROM tmp_creator_signatures);
  `,
    // ──────────────────
    // SELECT - pagination
    // ──────────────────
    FETCH_LATEST: `
    SELECT * FROM transactions
    ORDER BY created_at DESC
    LIMIT $1;
  `,
    FETCH_OLDEST: `
    SELECT * FROM transactions
    ORDER BY created_at ASC
    LIMIT $1;
  `,
    FETCH_PAGE_BY_PAIR: `
    SELECT * FROM transactions
    WHERE pair_id = $1
      AND created_at < $2
    ORDER BY created_at DESC
    LIMIT $3;
  `,
    FETCH_PAGE_BY_USER: `
    SELECT * FROM transactions
    WHERE user_address = $1
      AND created_at < $2
    ORDER BY created_at DESC
    LIMIT $3;
  `,
    // ──────────────────
    // SELECT - aggregates
    // ──────────────────
    COUNT_BY_PAIR: `
    SELECT COUNT(*) as count
    FROM transactions
    WHERE pair_id = $1;
  `,
    COUNT_BY_USER: `
    SELECT COUNT(*) as count
    FROM transactions
    WHERE user_address = $1;
  `,
    SUM_VOLUME_BY_PAIR: `
    SELECT
      pair_id,
      SUM(sol_amount) as total_sol_volume,
      SUM(token_amount) as total_token_volume,
      COUNT(*) as tx_count
    FROM transactions
    WHERE pair_id = $1
    GROUP BY pair_id;
  `,
    SUM_VOLUME_BY_USER: `
    SELECT
      user_address,
      SUM(sol_amount) as total_sol_volume,
      SUM(token_amount) as total_token_volume,
      COUNT(*) as tx_count
    FROM transactions
    WHERE user_address = $1
    GROUP BY user_address;
  `,
    // ──────────────────
    // SELECT - time range
    // ──────────────────
    FETCH_BY_PAIR_IN_RANGE: `
    SELECT * FROM transactions
    WHERE pair_id = $1
      AND timestamp >= $2
      AND timestamp <= $3
    ORDER BY timestamp ASC;
  `,
    FETCH_BY_USER_IN_RANGE: `
    SELECT * FROM transactions
    WHERE user_address = $1
      AND timestamp >= $2
      AND timestamp <= $3
    ORDER BY timestamp ASC;
  `,
    // ──────────────────
    // ROLLUPS
    // ──────────────────
    UPSERT_PAIR_ROLLUP: `
    INSERT INTO pair_volume_rollups (pair_id, total_sol_volume, total_token_volume, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (pair_id) DO UPDATE SET
      total_sol_volume = EXCLUDED.total_sol_volume,
      total_token_volume = EXCLUDED.total_token_volume,
      updated_at = NOW();
  `,
    FETCH_PAIR_ROLLUP: `
    SELECT * FROM pair_volume_rollups
    WHERE pair_id = $1;
  `,
    // ──────────────────
    // EXISTS checks (fast paths)
    // ──────────────────
    EXISTS_BY_SIGNATURE: `
    SELECT 1 FROM transactions
    WHERE signature = $1
    LIMIT 1;
  `,
    EXISTS_BY_ID: `
    SELECT 1 FROM transactions
    WHERE id = $1
    LIMIT 1;
  `,
    // ──────────────────
    // SELECT - bulk by ids (pairs.tcns hydration)
    // ──────────────────
    FETCH_BY_IDS: `
  SELECT *
  FROM transactions
  WHERE id = ANY($1::int[])
  ORDER BY timestamp ASC;
`,
};
