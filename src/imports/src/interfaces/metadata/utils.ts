import { SCALAR_COLUMNS, JSON_COLUMNS } from './schemas.js';
import {type MetaDataEnrichGroup} from './constants.js';
import type {MetaDataRow} from './schemas.js';
export function buildMetadataUpsert(input: Record<string, any>) {
  const cols: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];

  let i = 1;

  // Only columns that are allowed to be inserted dynamically
  const INSERTABLE_COLUMNS = [
    ...SCALAR_COLUMNS.filter(
      c => !['id', 'created_at', 'updated_at', 'processed_at'].includes(c)
    ),
    ...JSON_COLUMNS,
  ];

  for (const col of INSERTABLE_COLUMNS) {
    // 🔑 Critical: skip columns that are not present
    if (input[col] === undefined) continue;

    cols.push(col);
    values.push(input[col]);
    placeholders.push(`$${i++}`);
  }

  if (!cols.includes('mint')) {
    throw new Error('buildMetadataUpsert(): mint is required');
  }

  const updateScalars = SCALAR_COLUMNS
    .filter(c => c !== 'mint')
    .map(
      c => `${c} = COALESCE(EXCLUDED.${c}, metadata.${c})`
    );

  const updateJson = JSON_COLUMNS.map(
    c => `${c} = COALESCE(metadata.${c}, '{}'::jsonb) || COALESCE(EXCLUDED.${c}, '{}'::jsonb)`
  );

  const sql = `
    INSERT INTO metadata (${cols.join(', ')}, created_at, updated_at, claimed_at)
    VALUES (${placeholders.join(', ')}, NOW(), NOW(), NOW() + INTERVAL '1 minute')
    ON CONFLICT (mint) DO UPDATE SET
      ${[...updateScalars, ...updateJson].join(',\n      ')},
      updated_at = NOW()
    RETURNING *;
  `;

  return { sql, values };
}
function hasGenesis(row: MetaDataRow): boolean {
  return !!(
    row.signature &&
    row.program_id &&
    row.timestamp
  );
}

function hasPda(row: MetaDataRow): boolean {
  return !!(
    row.bonding_curve &&
    row.associated_bonding_curve &&
    row.metadata_pda
  );
}

function hasOnchain(row: MetaDataRow): boolean {
  return !!row.onchain_metadata;
}

function hasOffchain(row: MetaDataRow): boolean {
  return !!row.offchain_metadata;
}

export function deriveMetaDataEnrichTypes(
  row: MetaDataRow | null
): MetaDataEnrichGroup[] {

  // nothing exists yet → full pipeline
  if (!row) {
    return ['genesis', 'pda', 'offchain','onchain'];
  }

  const missing: MetaDataEnrichGroup[] = [];

  if (!hasGenesis(row)) {
    return ['genesis']; // hard gate
  }

  if (!hasPda(row)) {
    missing.push('pda');
  }

  if (!hasOnchain(row)) {
    missing.push('onchain');
  }

  if (!hasOffchain(row)) {
    missing.push('offchain');
  }

  return missing;
}