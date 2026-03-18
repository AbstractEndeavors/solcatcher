import { bindRepo, LogPayloadRow } from "./imports.js";
import * as src from "./src/index.js";
// ============================================================
// REPOSITORY
// ============================================================
export class LogPayloadRepository {
    db;
    constructor(db) {
        this.db = db;
        bindRepo(this, { src });
    }
    rowToModel(row) {
        return new LogPayloadRow(row.id, row.signature, row.program_id, row.discriminator, row.payload_len, row.event, row.depth, row.invocation_index, row.reported_invocation, row.parent_program_id, row.parent_event, row.b64, row.decodable, row.decoded_data, row.processed, row.failed, row.created_at, row.processed_at);
    }
}
export function createLogPayloadRepository(db) {
    return new LogPayloadRepository(db);
}
