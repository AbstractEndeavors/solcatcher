import { PostgresDatabaseClient } from './PostgresDatabaseClient.js';
const FILE_LOCATION = "src/imports/db/config/helper_functions.ts";
// ======================
// FACTORY FUNCTION
// ======================
// helper_functions.ts
import { getPgPool } from "@imports";
export function createDatabaseClient(config) {
    return new PostgresDatabaseClient(getPgPool(), config);
}
// ======================
// HELPER FUNCTIONS
// ======================
/**
 * Extract first row from query result
 */
export function extractRow(result) {
    if (!result || typeof result !== "object" || !("rows" in result)) {
        throw new Error("extractRow called with non-QueryResult");
    }
    return result.rows.length > 0 ? result.rows[0] : null;
}
export function extractId(result) {
    const row = extractRow(result);
    return row?.id ?? null;
}
/**
 * Extract all rows from query result
 */
export function extractRows(result) {
    if (!result || !Array.isArray(result.rows)) {
        console.log({
            message: 'extractRows called with invalid result',
            logType: 'error',
            file_location: FILE_LOCATION,
        });
        return [];
    }
    return result.rows;
}
