// src/db/repositories/repos/metadata/query-registry.ts
export const QueryRegistry = {
    CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS metadata (
      id SERIAL PRIMARY KEY,
      
      -- ═══════════════════════════════════════════
      -- IDENTITY (always required)
      -- ═══════════════════════════════════════════
      mint TEXT UNIQUE NOT NULL,
      
      -- ═══════════════════════════════════════════
      -- GENESIS FIELDS (from CreateEvent)
      -- ═══════════════════════════════════════════
      name TEXT,
      symbol TEXT,
      uri TEXT,
      discriminator TEXT,
      
      -- Actors
      user_address TEXT,
      creator TEXT,
      
      -- Chain context
      signature TEXT,
      bonding_curve TEXT,
      associated_bonding_curve TEXT,
      program_id TEXT,
      timestamp TIMESTAMPTZ,
      
      -- ═══════════════════════════════════════════
      -- ONCHAIN METADATA (from Metaplex)
      -- ═══════════════════════════════════════════
      metadata_pda TEXT,
      update_authority TEXT,
      mint_authority TEXT,
      freeze_authority TEXT,
      seller_fee_basis_points INTEGER,
      is_mutable BOOLEAN,
      primary_sale_happened BOOLEAN,
      token_standard TEXT,
      
      -- ═══════════════════════════════════════════
      -- OFFCHAIN METADATA (from URI fetch)
      -- ═══════════════════════════════════════════
      image TEXT,
      description TEXT,
      external_url TEXT,
      
      -- ═══════════════════════════════════════════
      -- RAW PAYLOADS (for debugging/replay)
      -- ═══════════════════════════════════════════
      onchain_metadata JSONB,
      offchain_metadata JSONB,
      spl_metadata JSONB,
      
      -- ═══════════════════════════════════════════
      -- LIFECYCLE
      -- ═══════════════════════════════════════════
      status TEXT NOT NULL DEFAULT 'stub',  -- stub | genesis | onchain | complete
      has_metadata BOOLEAN NOT NULL DEFAULT FALSE,
      has_onchain_metadata BOOLEAN NOT NULL DEFAULT FALSE,
      has_offchain_metadata BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );
  `,
    CREATE_INDEXES: [
        `CREATE INDEX IF NOT EXISTS idx_metadata_mint ON metadata(mint);`,
        `CREATE INDEX IF NOT EXISTS idx_metadata_status ON metadata(status);`,
        `CREATE INDEX IF NOT EXISTS idx_metadata_program_id ON metadata(program_id);`,
        `CREATE INDEX IF NOT EXISTS idx_metadata_creator ON metadata(creator);`,
        `CREATE INDEX IF NOT EXISTS idx_metadata_unprocessed 
      ON metadata(updated_at) WHERE processed_at IS NULL;`,
        `CREATE INDEX IF NOT EXISTS idx_metadata_pending_uri
      ON metadata(id) WHERE status = 'genesis' AND uri IS NOT NULL;`,
    ],
    // ═══════════════════════════════════════════════════════════
    // INSERT - Stub (mint only)
    // ═══════════════════════════════════════════════════════════
    INSERT_STUB: `
    INSERT INTO metadata (mint,program_id,status)
    VALUES ($1,$2,'stub')
    ON CONFLICT (mint) DO UPDATE SET
    program_id = COALESCE(EXCLUDED.program_id, metadata.program_id)
    RETURNING id;
  `,
    // ═══════════════════════════════════════════════════════════
    // INSERT - Genesis (from CreateEvent)
    // ═══════════════════════════════════════════════════════════
    INSERT_GENESIS: `
    INSERT INTO metadata (
      mint, name, symbol, uri, discriminator,
      user_address, creator,
      signature, bonding_curve, associated_bonding_curve,
      program_id, timestamp, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'genesis')
    ON CONFLICT (mint) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, metadata.name),
      symbol = COALESCE(EXCLUDED.symbol, metadata.symbol),
      uri = COALESCE(EXCLUDED.uri, metadata.uri),
      discriminator = COALESCE(EXCLUDED.discriminator, metadata.discriminator),
      user_address = COALESCE(EXCLUDED.user_address, metadata.user_address),
      creator = COALESCE(EXCLUDED.creator, metadata.creator),
      signature = COALESCE(EXCLUDED.signature, metadata.signature),
      bonding_curve = COALESCE(EXCLUDED.bonding_curve, metadata.bonding_curve),
      associated_bonding_curve = COALESCE(EXCLUDED.associated_bonding_curve, metadata.associated_bonding_curve),
      program_id = COALESCE(EXCLUDED.program_id, metadata.program_id),
      timestamp = COALESCE(EXCLUDED.timestamp, metadata.timestamp),
      status = CASE 
        WHEN metadata.status = 'stub' THEN 'genesis'
        ELSE metadata.status
      END,
      updated_at = NOW()
    RETURNING id;
  `,
    UPSERT_GENESIS: `INSERT INTO metadata (
    id, mint, name, symbol, uri, discriminator,
    user_address, creator, signature,
    bonding_curve, associated_bonding_curve, program_id,
    timestamp, metadata_pda, update_authority,
    mint_authority, freeze_authority, seller_fee_basis_points,
    is_mutable, primary_sale_happened, token_standard,
    image, description, external_url,
    onchain_metadata, offchain_metadata, spl_metadata,
    status, created_at, updated_at, processed_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11, $12, $13, $14, $15, $16, $17, $18, $19, $20,$21, $22, $23, $24, $25, $26, $27, $28, $29 , $1, $30 ...)
  ON CONFLICT (mint) DO UPDATE SET
      -- Scalar fields: new wins if non-null, else keep existing
      name = COALESCE(EXCLUDED.name, metadata.name),
      symbol = COALESCE(EXCLUDED.symbol, metadata.symbol),
      uri = COALESCE(EXCLUDED.uri, metadata.uri),
      discriminator = COALESCE(EXCLUDED.discriminator, metadata.discriminator),
      user_address = COALESCE(EXCLUDED.user_address, metadata.user_address),
      creator = COALESCE(EXCLUDED.creator, metadata.creator),
      signature = COALESCE(EXCLUDED.signature, metadata.signature),
      bonding_curve = COALESCE(EXCLUDED.bonding_curve, metadata.bonding_curve),
      associated_bonding_curve = COALESCE(EXCLUDED.associated_bonding_curve, metadata.associated_bonding_curve),
      program_id = COALESCE(EXCLUDED.program_id, metadata.program_id),
      timestamp = COALESCE(EXCLUDED.timestamp, metadata.timestamp),
      image = COALESCE(EXCLUDED.image, metadata.image),
      description = COALESCE(EXCLUDED.description, metadata.description),
      -- ... repeat for other scalar fields
      
      -- JSON fields: deep merge (existing || new means new keys win, existing preserved)
      offchain_metadata = COALESCE(metadata.offchain_metadata, '{}'::jsonb) 
                          || COALESCE(EXCLUDED.offchain_metadata, '{}'::jsonb),
      onchain_metadata = COALESCE(metadata.onchain_metadata, '{}'::jsonb) 
                        || COALESCE(EXCLUDED.onchain_metadata, '{}'::jsonb),
      spl_metadata = COALESCE(metadata.spl_metadata, '{}'::jsonb) 
                    || COALESCE(EXCLUDED.spl_metadata, '{}'::jsonb),
      
      updated_at = NOW()
  `,
    INSERT_IDENTITY: `
    INSERT INTO metadata (mint,program_id, status)
    VALUES ($1,$2, 'stub')
    ON CONFLICT (mint) DO NOTHING
    RETURNING id;
    `,
    // ═══════════════════════════════════════════════════════════
    // UPDATE - Onchain Metadata (from Metaplex)
    // ═══════════════════════════════════════════════════════════
    ENRICH_ONCHAIN: `
  UPDATE metadata SET
    name             = COALESCE($2,  name),
    uri              = COALESCE($3,  uri),
    symbol           = COALESCE($4,  symbol),
    metadata_pda     = COALESCE($5,  metadata_pda),
    update_authority = COALESCE($6,  update_authority),
    mint_authority   = COALESCE($7,  mint_authority),
    freeze_authority = COALESCE($8,  freeze_authority),
    seller_fee_basis_points = COALESCE($9,  seller_fee_basis_points),
    is_mutable       = COALESCE($10, is_mutable),
    primary_sale_happened   = COALESCE($11, primary_sale_happened),
    token_standard   = COALESCE($12, token_standard),
    onchain_metadata = COALESCE($13, onchain_metadata),
    spl_metadata     = COALESCE($14, spl_metadata),
    has_onchain_metadata = TRUE,
    status = CASE
      WHEN status IN ('stub', 'genesis') THEN 'onchain'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = $1
  RETURNING id;
`,
    ENRICH_OFFCHAIN: `
  UPDATE metadata SET
    image              = COALESCE($2, image),
    description        = COALESCE($3, description),
    external_url       = COALESCE($4, external_url),
    offchain_metadata  = COALESCE($5, offchain_metadata),
    has_offchain_metadata = TRUE,
    status = CASE
      WHEN status IN ('stub', 'genesis', 'onchain') THEN 'complete'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = $1
  RETURNING id;
`,
    // ═══════════════════════════════════════════════════════════
    // FETCH
    // ═══════════════════════════════════════════════════════════
    FETCH_BY_ID: `SELECT * FROM metadata WHERE id = $1 LIMIT 1;`,
    FETCH_BY_MINT: `SELECT * FROM metadata WHERE mint = $1 LIMIT 1;`,
    GET_ID_BY_MINT: `SELECT id FROM metadata WHERE mint = $1 LIMIT 1;`,
    FETCH_PENDING_URI: `
    SELECT * FROM metadata 
    WHERE status = 'genesis' AND uri IS NOT NULL
    ORDER BY created_at ASC
    LIMIT $1;
  `,
    FETCH_PENDING_ONCHAIN: `
    SELECT * FROM metadata
    WHERE status IN ('stub', 'genesis') AND has_metadata = FALSE
    ORDER BY created_at ASC
    LIMIT $1;
  `,
    FETCH_BY_LIMIT_LATEST: `
    SELECT * FROM metadata
    ORDER BY created_at DESC
    LIMIT $1;
  `,
    FETCH_BY_LIMIT_OLDEST: `
    SELECT * FROM metadata
    ORDER BY created_at ASC
    LIMIT $1;
  `,
    // ═══════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════
    MARK_PROCESSED: `
    UPDATE metadata SET
      processed_at = NOW(),
      updated_at = NOW()
    WHERE mint = $1
    RETURNING id;
  `,
    CHECK_PROCESSED: `
    SELECT processed_at IS NOT NULL as processed
    FROM metadata
    WHERE mint = $1;
  `,
};
