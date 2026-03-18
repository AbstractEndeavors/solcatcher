import {type IdLike} from './imports.js';
/**
 * Extract all rows from query result
 */
export function extractRows<T = any>(
  result:any
): T[] {
  if (!result || !Array.isArray(result.rows)) {

    return [];
  }

  return result.rows;
}
export function expectSingleRow<T>(
  value: T | T[] | null
): T {
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
export function extractSingle<T>(
  value: T | T[]
): T {
  if (Array.isArray(value) && value.length !== 1) {
    throw new Error(`Expected single item, got ${value.length}`);
  }
  return Array.isArray(value) ? value[0] : value;
}

export function firstRowOrNull<T>(
  value: T | T[] | null
): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function extractRow<T = any>(
  result: any
): T | null {
  if (!result || typeof result !== "object" || !("rows" in result)) {
    throw new Error(
      "extractRow called with non-QueryResult"
    );
  }

  return result.rows.length > 0 ? result.rows[0] : null;
}
export function firstRowIdOrNull(
  result: { rows?: { id?: unknown }[] } | null | undefined
): IdLike | null {
  const id = result?.rows?.[0]?.id;
  return typeof id === 'number' ? id : null;
}