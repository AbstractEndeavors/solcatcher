// src/db/repositories/repos/pairs/query-registry.ts
export const QueryRegistry = {
    CREATE_TABLE: `
CREATE TABLE IF NOT EXISTS pairs (
  id SERIAL PRIMARY KEY,

  -- canonical identity (required)
  mint TEXT NOT NULL UNIQUE,
  program_id TEXT NOT NULL,

  -- genesis fields
  token_program TEXT DEFAULT NULL,
  bonding_curve TEXT DEFAULT NULL,
  associated_bonding_curve TEXT DEFAULT NULL,

  -- genesis context
  creator TEXT DEFAULT NULL,
  signature TEXT DEFAULT NULL,
  slot INTEGER DEFAULT NULL,
  timestamp TIMESTAMPTZ DEFAULT NULL,

  -- genesis reserves (immutable)
  virtual_token_reserves NUMERIC(20,0) DEFAULT NULL,
  virtual_sol_reserves NUMERIC(20,0) DEFAULT NULL,
  real_token_reserves NUMERIC(20,0) DEFAULT NULL,
  token_total_supply NUMERIC(20,0) DEFAULT NULL,

  -- provenance
  log_id INTEGER DEFAULT NULL,
  txn_id INTEGER DEFAULT NULL,
  meta_id INTEGER DEFAULT NULL,

  -- lifecycle
  status TEXT NOT NULL DEFAULT 'stub',  -- 'stub' | 'complete'
  tcns INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT pairs_program_mint_unique UNIQUE (program_id, mint)
);
  `,
    CREATE_INDEXES: [
        `CREATE INDEX IF NOT EXISTS idx_pairs_program_id ON pairs(program_id);`,
        `CREATE INDEX IF NOT EXISTS idx_pairs_creator ON pairs(creator);`,
        `CREATE INDEX IF NOT EXISTS idx_pairs_processed ON pairs(processed_at);`,
        `CREATE INDEX IF NOT EXISTS idx_pairs_created_chain ON pairs(timestamp);`,
    ],
    UPSERT_PAIR_FULL: `
  WITH upsert AS (
    INSERT INTO pairs (
      mint,
      program_id,
      token_program,
      bonding_curve,
      associated_bonding_curve,
      creator,
      signature,
      virtual_token_reserves,
      virtual_sol_reserves,
      real_token_reserves,
      token_total_supply,
      log_id,
      txn_id,
      meta_id,
      slot,
      timestamp,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'complete')
    ON CONFLICT ON CONSTRAINT pairs_program_mint_unique DO UPDATE SET
      program_id = COALESCE(EXCLUDED.program_id, pairs.program_id),
      token_program = COALESCE(EXCLUDED.token_program, pairs.token_program),
      bonding_curve = COALESCE(EXCLUDED.bonding_curve, pairs.bonding_curve),
      associated_bonding_curve = COALESCE(EXCLUDED.associated_bonding_curve, pairs.associated_bonding_curve),
      creator = COALESCE(EXCLUDED.creator, pairs.creator),
      signature = COALESCE(EXCLUDED.signature, pairs.signature),
      virtual_token_reserves = COALESCE(EXCLUDED.virtual_token_reserves, pairs.virtual_token_reserves),
      virtual_sol_reserves = COALESCE(EXCLUDED.virtual_sol_reserves, pairs.virtual_sol_reserves),
      real_token_reserves = COALESCE(EXCLUDED.real_token_reserves, pairs.real_token_reserves),
      token_total_supply = COALESCE(EXCLUDED.token_total_supply, pairs.token_total_supply),
      log_id = COALESCE(EXCLUDED.log_id, pairs.log_id),
      txn_id = COALESCE(EXCLUDED.txn_id, pairs.txn_id),
      meta_id = COALESCE(EXCLUDED.meta_id, pairs.meta_id),
      slot = COALESCE(EXCLUDED.slot, pairs.slot),
      timestamp = COALESCE(EXCLUDED.timestamp, pairs.timestamp),
      status = 'complete',
      updated_at = NOW()
    RETURNING id
  )
  SELECT p.*
  FROM pairs p
  JOIN upsert u ON u.id = p.id;
  `,
    INSERT_PAIR: `
    INSERT INTO pairs (
     mint,
     program_id,
     token_program,
     bonding_curve,
     associated_bonding_curve,
     creator,
     signature,
     virtual_token_reserves,
     virtual_sol_reserves,
     real_token_reserves,
     token_total_supply,
     log_id,
     txn_id,
     meta_id,
     slot,
     timestamp
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT ON CONSTRAINT pairs_program_mint_unique DO NOTHING
    RETURNING id;
  `,
    // In query-registry.ts:
    ENRICH_FULL: `
  UPDATE pairs SET
    bonding_curve = COALESCE($2, bonding_curve),
    associated_bonding_curve = COALESCE($3, associated_bonding_curve),
    token_program = COALESCE($4, token_program),
    creator = COALESCE($5, creator),
    virtual_token_reserves = COALESCE($6, virtual_token_reserves),
    virtual_sol_reserves = COALESCE($7, virtual_sol_reserves),
    real_token_reserves = COALESCE($8, real_token_reserves),
    token_total_supply = COALESCE($9, token_total_supply),
    status = CASE
      WHEN status = 'stub' THEN 'complete'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = $1
  RETURNING id;
`,
    UPDATE_CHAIN_TIMESTAMP: `
  UPDATE pairs SET
    timestamp = COALESCE($2, timestamp),
    updated_at = NOW()
  WHERE id = $1
  RETURNING id;
`,
    ENRICH_PAIR: `
    UPDATE pairs
    SET
      log_id = COALESCE($2, log_id),
      txn_id = COALESCE($3, txn_id),
      meta_id = COALESCE($4, meta_id),
      signature = COALESCE($5, signature),
      associated_bonding_curve = COALESCE($6, associated_bonding_curve),
      updated_at = NOW()
    WHERE id = $1
    RETURNING id;
  `,
    APPEND_TCNS: `
    UPDATE pairs
    SET tcns = tcns || $2::int[], updated_at = NOW()
    WHERE id = $1
    RETURNING id;
  `,
    APPEND_TCN: `
      UPDATE pairs
      SET
        tcns = tcns || $2::int,
        updated_at = NOW()
      WHERE id = $1
      `,
    INSERT_IDENTITY: `
  INSERT INTO pairs (mint, program_id, status)
  VALUES ($1, $2, 'stub')
  ON CONFLICT ON CONSTRAINT pairs_program_mint_unique DO NOTHING
  RETURNING id;
`,
    // ────────────────────────────────────────────────────────
    // SELECT
    // ────────────────────────────────────────────────────────
    FETCH_BY_ID: `SELECT * FROM pairs WHERE id = $1 LIMIT 1;`,
    FETCH_BY_MINT: `SELECT * FROM pairs WHERE mint = $1 LIMIT 1;`,
    FETCH_BY_BONDING_CURVE: `SELECT * FROM pairs WHERE bonding_curve = $1 LIMIT 1;`,
    FETCH_BY_PROGRAM: `SELECT * FROM pairs WHERE program_id = $1;`,
    FETCH_BY_MINT_AND_PROGRAM: `
    SELECT * FROM pairs
    WHERE mint = $1 AND program_id = $2
    LIMIT 1;
  `,
    FETCH_BY_ASSOCIATED_BONDING_CURVE: `
    SELECT * FROM pairs
    WHERE associated_bonding_curve = $1
    LIMIT 1;
  `,
    FETCH_BY_SIGNATURE: `
    SELECT * FROM pairs
    WHERE signature = $1
    LIMIT 1;
  `,
    FETCH_STUBS: `
   SELECT * FROM pairs
   WHERE status = 'stub'
   ORDER BY created_at ASC
   LIMIT $1;
   `,
    FETCH_CURSOR_INITIAL: `
  SELECT *
  FROM pairs
  ORDER BY created_at DESC, id DESC
  LIMIT $1
`,
    FETCH_CURSOR: `
  SELECT *
  FROM pairs
  WHERE
    (created_at < $1)
    OR (created_at = $2 AND id < $3)
  ORDER BY created_at DESC, id DESC
  LIMIT $4
`,
};
