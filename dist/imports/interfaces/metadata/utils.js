import { ALL_COLUMNS, SCALAR_COLUMNS, JSON_COLUMNS } from './schemas.js';
export function buildMetadataUpsert(input) {
    const cols = [];
    const values = [];
    const placeholders = [];
    let i = 1;
    // Only columns that are allowed to be inserted dynamically
    const INSERTABLE_COLUMNS = [
        ...SCALAR_COLUMNS.filter(c => !['id', 'created_at', 'updated_at', 'processed_at'].includes(c)),
        ...JSON_COLUMNS,
    ];
    for (const col of INSERTABLE_COLUMNS) {
        // 🔑 Critical: skip columns that are not present
        if (input[col] === undefined)
            continue;
        cols.push(col);
        values.push(input[col]);
        placeholders.push(`$${i++}`);
    }
    if (!cols.includes('mint')) {
        throw new Error('buildMetadataUpsert(): mint is required');
    }
    const updateScalars = SCALAR_COLUMNS
        .filter(c => c !== 'mint')
        .map(c => `${c} = COALESCE(EXCLUDED.${c}, metadata.${c})`);
    const updateJson = JSON_COLUMNS.map(c => `${c} = jsonb_merge_deep(metadata.${c}, EXCLUDED.${c})`);
    const sql = `
    INSERT INTO metadata (${cols.join(', ')}, created_at, updated_at)
    VALUES (${placeholders.join(', ')}, NOW(), NOW())
    ON CONFLICT (mint) DO UPDATE SET
      ${[...updateScalars, ...updateJson].join(',\n      ')},
      updated_at = NOW()
    RETURNING *;
  `;
    return { sql, values };
}
