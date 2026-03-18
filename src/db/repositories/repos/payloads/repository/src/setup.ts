// ──────────────────────────────────────────────────────
// SETUP
// ──────────────────────────────────────────────────────
import {
  LogPayloadRepository,
  QueryRegistry
} from './imports.js';
export async function createTable(
  this:LogPayloadRepository
): Promise<void> {
  await this.db.query(
    QueryRegistry.CREATE_TABLE);
  await this.db.query(
    QueryRegistry.CREATE_UNKNOWN_INSTRUCTIONS_TABLE);

  for (
    const indexQuery of 
    QueryRegistry.CREATE_INDEXES
  ) {
    await this.db.query(indexQuery);
  }
}

