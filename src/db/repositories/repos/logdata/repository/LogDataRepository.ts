import type { DatabaseClient } from "@imports";
import {bindRepo} from '@imports';
import * as src from './src/index.js';
import {LogDataRow} from '@imports';
import type {DataLike} from '@imports';
export type LogDataRepositoryBindings =
  & typeof src;
export interface LogDataRepository extends LogDataRepositoryBindings {}
// ============================================================
// REPOSITORY
// ============================================================
export class LogDataRepository {
  constructor(public readonly db: DatabaseClient) {    
    bindRepo(this, {
        src
        });
  }
      rowToModel(row: DataLike): LogDataRow {
      return new LogDataRow(
        row.id,
        row.signature,
        row.slot,
        row.program_id,
        row.logs_b64,
        row.parsed_logs,
        row.pair_id,
        row.txn_id,
        row.sorted,
        row.signatures,
        row.intake_at,
        row.created_at,
        row.updated_at
      );
    }
}
