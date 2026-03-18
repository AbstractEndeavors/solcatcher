import { QueryRegistry } from "./../../query-registry.js";
import type { LogDataRepository } from "./../LogDataRepository.js";
import {type IdLike,type SigLike,firstRowIdOrNull,firstRowOrNull,LogDataRow,type RepoResult} from '@imports';
import { expectSingleRow } from '@imports';
export async function insert(
  this: LogDataRepository,
  raw: any
): Promise<RepoResult<LogDataRow>> {
  if (!raw || typeof raw !== "object") {
    return { ok: false, value: null, reason: "invalid_payload" };
  }

  const signature = String(raw.signature ?? "").trim();
  if (!signature) {
    return { ok: false, value: null, reason: "missing_signature" };
  }

  if (!raw.logs_b64) {
    return { ok: false, value: null, reason: "missing_logs_b64" };
  }

  const values = [
    signature,
    typeof raw.slot === "number" ? raw.slot : null,
    typeof raw.program_id === "string" ? raw.program_id : null,
    raw.logs_b64,
    Array.isArray(raw.signatures) ? raw.signatures.map(String) : null,
  ];

  const result = await this.db.query<{ id: IdLike }>(
    QueryRegistry.INSERT,
    values
  );

  const id = result.rows[0]?.id;
  if (!id) {
    return { ok: false, value: null, reason: "insert_returned_no_id" };
  }

  const full = await this.db.query(QueryRegistry.FETCH_BY_ID, [id]);
  const row = full.rows[0];

  if (!row) {
    return {
      ok: true,
      value: null,
      reason: "row_not_refetched",
      meta: { id }
    };
  }

  return {
    ok: true,
    value: this.rowToModel(row)
  };
}
export async function insertBatch(
  this: LogDataRepository,
  rows: any[]
): Promise<RepoResult<Map<SigLike, IdLike>>> {
  if (!rows.length) {
    return { ok: true, value: new Map() };
  }

  const values = [
    rows.map(r => r.signature),
    rows.map(r => r.slot),
    rows.map(r => r.program_id),
    rows.map(r => r.logs_b64),
    rows.map(r => r.normalizedSignatures || null),
  ];

  const result = await this.db.query<{
    id: IdLike;
    signature: SigLike;
  }>(QueryRegistry.BATCH_INSERT, values);

  return {
    ok: true,
    value: new Map(result.rows.map(r => [r.signature, r.id]))
  };
}
export async function insertUnknownInstruction(
  this: LogDataRepository,
  row: any
): Promise<void> {
  await this.db.query(`
    INSERT INTO unknown_instructions
    (signature, program_id, invocation_index, discriminator, data_prefix, reason)
    VALUES ($1,$2,$3,$4,$5,$6)
  `, [
    row.signature ?? null,
    row.program_id ?? null,
    row.invocation_index ?? null,
    row.discriminator ?? null,
    row.data_prefix ?? null,
    row.reason ?? 'unknown',
  ]);
}
export async function insertIntent(
  this: LogDataRepository,
  signature: SigLike
): Promise<IdLike> {
  const result = await this.db.query<{ id: IdLike }>(
    QueryRegistry.INSERT_INTENT,
    [signature]
  );

  const id = firstRowIdOrNull(result);
  if (!id) throw new Error("insertIntent(): failed");

  return id;
}
