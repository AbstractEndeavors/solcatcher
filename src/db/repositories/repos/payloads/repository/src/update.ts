// ──────────────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────────────
import {
  LogPayloadRow,
  LogPayloadRepository,
  QueryRegistry,
} from './imports.js';
import type { IdLike } from './imports.js';

export async function markProcessed(
  this: LogPayloadRepository,
  id: IdLike
): Promise<LogPayloadRow | null> {
  const result = await this.db.query<LogPayloadRow>(
    QueryRegistry.MARK_PROCESSED,
    [id]
  );
  const row = result.rows[0];
  return row ? this.rowToModel(row) : null;
}

export async function markFailed(
  this: LogPayloadRepository,
  id: IdLike
): Promise<LogPayloadRow | null> {
  const result = await this.db.query<LogPayloadRow>(
    QueryRegistry.MARK_FAILED,
    [id]
  );
  const row = result.rows[0];
  return row ? this.rowToModel(row) : null;
}

export async function setDecodedData(
  this: LogPayloadRepository,
  id: IdLike,
  data: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const result = await this.db.query<{ decoded_data: Record<string, unknown> }>(
    QueryRegistry.SET_DECODED_DATA,
    [id, JSON.stringify(data)]
  );
  // was: result[0] — missing .rows, silently returned undefined
  const row = result.rows[0];
  return row?.decoded_data ?? null;
}

export async function setDecodable(
  this: LogPayloadRepository,
  id: IdLike
): Promise<LogPayloadRow | null> {
  const result = await this.db.query<LogPayloadRow>(
    QueryRegistry.SET_DECODABLE,
    [id]
  );
  const row = result.rows[0];
  return row ? this.rowToModel(row) : null;
}

export async function setUndecodable(
  this: LogPayloadRepository,
  id: IdLike
): Promise<LogPayloadRow | null> {
  const result = await this.db.query<LogPayloadRow>(
    QueryRegistry.SET_UNDECODABLE,
    [id]
  );
  const row = result.rows[0];
  return row ? this.rowToModel(row) : null;
}