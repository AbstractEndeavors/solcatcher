// src/db/repositories/repos/metadata/service.ts
import { MetaDataRepository } from './repository/MetaDataRepository.js';
import { createEventToGenesisParams, expectSingleRow, SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
export class MetaDataService {
    repo;
    r;
    constructor(config) {
        this.repo = new MetaDataRepository(config.db);
        this.r = new MetaDataRepository(config.db);
    }
    // ─────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────
    async start() {
        await this.repo.createTable();
    }
    // ─────────────────────────────────────────────
    // RESOLVE (stub or existing)
    // ─────────────────────────────────────────────
    /**
     * Get or create stub metadata.
     * Returns { id, was_stub } to signal if enrichment is needed.
     */
    async resolveOrStub(mint, program_id) {
        const existing = await this.repo.fetchByMint(mint);
        if (existing) {
            return { id: existing.id, was_stub: false };
        }
        const id = await this.repo.insertStub(mint, program_id);
        return { id, was_stub: true };
    }
    // ─────────────────────────────────────────────
    // INSERT - From CreateEvent
    // ─────────────────────────────────────────────
    /**
     * Upsert genesis metadata from a CreateEvent.
     * Upgrades stub → genesis if exists.
     */
    async insertFromCreateEvent(event) {
        const params = createEventToGenesisParams(event);
        return await this.repo.insertGenesis(params);
    }
    async upsertGenesis(params) {
        return await this.repo.upsertGenesis(params);
    }
    /**
     * Insert genesis metadata directly.
     */
    async insertGenesis(params) {
        return await this.repo.insertGenesis(params);
    }
    // ─────────────────────────────────────────────
    // ENRICH
    // ─────────────────────────────────────────────
    /**
     * Enrich with onchain metadata from Metaplex.
     */
    async enrichOnchain(id, params) {
        return await this.repo.enrichOnchain(id, params);
    }
    /**
     * Enrich with offchain metadata from URI fetch.
     */
    async enrichOffchain(id, params) {
        return await this.repo.enrichOffchain(id, params);
    }
    // ─────────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────────
    async fetch(params) {
        return await this.repo.fetch(params);
    }
    async fetchById(id) {
        return await this.repo.fetchById(id);
    }
    async fetchByMint(mint) {
        return await this.repo.fetchByMint(mint);
    }
    async getIdByMint(mint) {
        return await this.repo.getIdByMint(mint);
    }
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
    // BATCH - Pending Enrichment
    // ─────────────────────────────────────────────
    async fetchPendingUri(limit) {
        return await this.repo.fetchPendingUri(limit);
    }
    async fetchPendingOnchain(limit) {
        return await this.repo.fetchPendingOnchain(limit);
    }
    async fetchBatchByMints(mints, program_ids) {
        const outRows = [];
        const ids = [];
        let last_valid_program_id = null;
        for (let i = 0; i++; i < mints.length) {
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
                    const rows = await this.fetchById(nuId);
                    const row = expectSingleRow(rows);
                    if (rows && row && row != null) {
                        outRows.push(row);
                    }
                }
            }
        }
        return outRows;
    }
    // ─────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────
    async markProcessed(mint) {
        return await this.repo.markProcessed(mint);
    }
}
export function createMetaDataService(config) {
    return new MetaDataService(config);
}
