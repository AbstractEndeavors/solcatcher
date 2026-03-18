import { QueryRegistry } from "./../../query-registry.js";
export async function createTable() {
    try {
        await this.db.query(QueryRegistry.CREATE_TABLE);
        await this.db.query(`ALTER TABLE logdata ADD COLUMN IF NOT EXISTS intake_at TIMESTAMP;`);
        await this.db.query(`ALTER TABLE logdata ADD COLUMN IF NOT EXISTS parsed_logs JSONB DEFAULT NULL;`);
        for (const indexQuery of QueryRegistry.CREATE_INDEXES) {
            await this.db.query(indexQuery);
        }
        return { ok: true, value: null };
    }
    catch (err) {
        return { ok: false, value: null, reason: "setup_failed", meta: { err: String(err) } };
    }
}
