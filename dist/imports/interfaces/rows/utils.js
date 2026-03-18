import {} from './imports.js';
/**
 * Extract all rows from query result
 */
export function extractRows(result) {
    if (!result || !Array.isArray(result.rows)) {
        return [];
    }
    return result.rows;
}
export function expectSingleRow(value) {
    if (!value) {
        throw new Error("Expected single row, got null");
    }
    if (Array.isArray(value)) {
        if (value.length !== 1) {
            throw new Error(`Expected exactly 1 row, got ${value.length}`);
        }
        return value[0];
    }
    return value;
}
export function extractSingle(value) {
    if (Array.isArray(value) && value.length !== 1) {
        throw new Error(`Expected single item, got ${value.length}`);
    }
    return Array.isArray(value) ? value[0] : value;
}
export function firstRowOrNull(value) {
    if (!value)
        return null;
    return Array.isArray(value) ? value[0] ?? null : value;
}
export function extractRow(result) {
    if (!result || typeof result !== "object" || !("rows" in result)) {
        throw new Error("extractRow called with non-QueryResult");
    }
    return result.rows.length > 0 ? result.rows[0] : null;
}
export function firstRowIdOrNull(result) {
    const id = result?.rows?.[0]?.id;
    return typeof id === 'number' ? id : null;
}
