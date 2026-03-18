// ──────────────────────────────────────────────────────
// INSERT
// ──────────────────────────────────────────────────────
import {
  LogPayloadRepository,
  QueryRegistry
} from './imports.js';
import type {BatchPayloadInsertSummary,InsertUnknownInstructionParams,LogPayloadBatchItem} from './imports.js';
export async function insertBatch(
  this: LogPayloadRepository,
  rows: LogPayloadBatchItem[]
): Promise<BatchPayloadInsertSummary[]> {
  if (!rows.length) return [];

  const { rows: inserted } = await this.db.query<{
    id: number;
    signature: string;
    program_id: string;
  }>(
    QueryRegistry.INSERT_BATCH,
    [JSON.stringify(rows)]
  );

  const map = new Map<string, BatchPayloadInsertSummary>();

  for (const r of inserted) {
    const key = `${r.signature}:${r.program_id}`;

    let entry = map.get(key);
    if (!entry) {
      entry = {
        signature: r.signature,
        program_id: r.program_id,
        ids: [],
        count: 0,
      };
      map.set(key, entry);
    }

    entry.ids.push(r.id);
    entry.count++;
  }

  return [...map.values()];
}
  /**
   * Insert a single unknown instruction record.
   */
export async function insertUnknownInstruction(
  this:LogPayloadRepository,
  params: InsertUnknownInstructionParams
): Promise<void> {
    await this.db.query(QueryRegistry.INSERT_UNKNOWN_INSTRUCTION, [
      params.signature,
      params.program_id,
      params.invocation_index,
      params.discriminator,
      params.data_prefix,
      params.reason,
    ]);
  }
