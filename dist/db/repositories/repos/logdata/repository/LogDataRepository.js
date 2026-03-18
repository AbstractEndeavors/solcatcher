import { bindRepo } from '@imports';
import * as src from './src/index.js';
import { LogDataRow } from '@imports';
// ============================================================
// REPOSITORY
// ============================================================
export class LogDataRepository {
    db;
    constructor(db) {
        this.db = db;
        bindRepo(this, {
            src
        });
    }
    rowToModel(row) {
        return new LogDataRow(row.id, row.signature, row.slot, row.program_id, row.logs_b64, row.parsed_logs, row.pair_id, row.txn_id, row.sorted, row.signatures, row.intake_at, row.created_at, row.updated_at);
    }
}
