import { type DatabaseClient, bindRepo, LogPayloadRow } from "./imports.js";
import { initializeRegistry } from "../imports.js";
import * as src from "./src/index.js";

export type LogPayloadRepositoryBindings = typeof src;
export interface LogPayloadRepository extends LogPayloadRepositoryBindings {}

// ============================================================
// REPOSITORY
//
// registry is injected at construction — not lazily initialized
// inside pipeline functions, not a module-level singleton.
//
// Callers that already have a registry (e.g. a queue worker that
// initialized one at startup) pass it in. The default argument
// covers the cases where the repo is created in isolation.
// ============================================================

export class LogPayloadRepository {
  public readonly registry: ReturnType<typeof initializeRegistry>;

  constructor(
    public readonly db: DatabaseClient,
    registry?: ReturnType<typeof initializeRegistry>
  ) {
    this.registry = registry ?? initializeRegistry();
    bindRepo(this, { src });
  }

  rowToModel(row: any): LogPayloadRow {
    return new LogPayloadRow(
      row.id,
      row.signature,
      row.program_id,
      row.discriminator,
      row.payload_len,
      row.event,
      row.depth,
      row.invocation_index,
      row.reported_invocation,
      row.parent_program_id,
      row.parent_event,
      row.b64,
      row.decodable,
      row.decoded_data,
      row.processed,
      row.failed,
      row.created_at,
      row.processed_at
    );
  }
}

export function createLogPayloadRepository(
  db: DatabaseClient,
  registry?: ReturnType<typeof initializeRegistry>
): LogPayloadRepository {
  return new LogPayloadRepository(db, registry);
}