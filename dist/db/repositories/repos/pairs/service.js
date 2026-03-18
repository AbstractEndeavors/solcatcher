import { PairsRepository } from "./repository/index.js";
import { expectSingleRow, SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
export class PairsService {
    repo;
    r;
    constructor(config) {
        // Explicit wiring
        this.r = new PairsRepository(config.db);
        this.repo = new PairsRepository(config.db);
    }
    // ─────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────
    async start() {
        await this.repo.createTable();
    }
    async insert(params) {
        return await this.repo.insert(params);
    }
    async upsert(data) {
        return await this.repo.upsert(data);
    }
    // ─────────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────────
    async fetch(params) {
        return await this.repo.fetch(params);
    }
    async fetchById(id) {
        return await this.repo.fetchById(id);
    }
    async fetchByMintAndProgram(mint, program_id) {
        return await this.repo.fetchByMintAndProgram(mint, program_id);
    }
    async fetchByBondingCurve(curve) {
        return await this.repo.fetchByBondingCurve(curve);
    }
    async fetchByAssociatedBondingCurve(curve) {
        return await this.repo.fetchByAssociatedBondingCurve(curve);
    }
    async fetchByGenesisSignature(sig) {
        return await this.repo.fetchByGenesisSignature(sig);
    }
    // ─────────────────────────────────────────────
    // ASSURE IDENTITY
    //
    // fetch() returns PairRow | null — null means "doesn't exist yet".
    // That's the normal insert path, NOT an error.
    // Do NOT use expectSingleRow here: it throws on null.
    // ─────────────────────────────────────────────
    async insertIdentity(params) {
        return await this.repo.insertIdentity(params);
    }
    async assureIdentity(params) {
        return await this.repo.assureIdentity(params);
    }
    async assureIdentityEnrich(params) {
        return await this.repo.assureIdentityEnrich(params);
    }
    // ─────────────────────────────────────────────
    // CREATE (GENESIS)
    // ─────────────────────────────────────────────
    async fetchBatchByMints(mints, program_ids) {
        const outRows = [];
        const ids = [];
        let last_valid_program_id = null;
        for (let i = 0; i < mints.length; i++) {
            let mint = null;
            let program_id = null;
            if (i < mints.length) {
                mint = mints[i];
            }
            if (i < program_ids.length) {
                program_id = program_ids[i];
                if (!last_valid_program_id) {
                    last_valid_program_id = program_id;
                }
            }
            if (mint && !program_id) {
                program_id = last_valid_program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
            }
            if (mint && program_id) {
                const nuId = await this.assureIdentity({ mint, program_id });
                if (nuId && !ids.includes(nuId)) {
                    ids.push(nuId);
                    const row = await this.fetchById(nuId);
                    if (row) {
                        outRows.push(row);
                    }
                }
            }
        }
        return outRows;
    }
    // ─────────────────────────────────────────────
    // TRANSACTION INDEXING
    // ─────────────────────────────────────────────
    /**
     * Append one or more transaction IDs to a pair.
     * Guarantees append-only behavior.
     */
    async appendTransactions(pairId, txnIds) {
        const ids = Array.isArray(txnIds) ? txnIds : [txnIds];
        if (!ids.length) {
            const pair = await this.repo.fetchById(pairId);
            if (!pair)
                throw new Error("appendTransactions(): pair not found");
            return pair;
        }
        await this.repo.appendTcns(pairId, ids);
        const updated = await this.repo.fetchById(pairId);
        if (!updated) {
            throw new Error("appendTransactions(): failed to reload pair");
        }
        return updated;
    }
    // ─────────────────────────────────────────────
    // LIFECYCLE MARKERS (OPTIONAL)
    // ─────────────────────────────────────────────
    /**
     * Mark pair as fully processed.
     * This is workflow-level state.
     */
    async markProcessed(pairId) {
        const pair = await this.repo.fetchById(pairId);
        if (!pair) {
            throw new Error("markProcessed(): pair not found");
        }
        if (pair.processed_at)
            return pair;
        // Simple explicit update (inline — no repository pollution)
        await this.repo["db"].query(`
      UPDATE pairs
      SET processed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1;
      `, [pairId]);
        const updated = await this.repo.fetchById(pairId);
        if (!updated) {
            throw new Error("markProcessed(): failed to reload pair");
        }
        return updated;
    }
    async getCursorPage(params) {
        const rows = await this.repo.fetchCursor({
            limit: params.limit,
            cursor_created_at: params.cursor?.created_at,
            cursor_id: params.cursor?.id,
        });
        if (rows.length) {
            const last = rows[rows.length - 1];
            params.cursor = {
                created_at: last.created_at,
                id: last.id,
            };
        }
        return {
            items: rows,
            next_cursor: params.cursor,
            has_more: rows.length === params.limit,
        };
    }
}
// ============================================================
// FACTORY (Explicit wiring)
// ============================================================
export function createPairsService(config) {
    return new PairsService(config);
}
