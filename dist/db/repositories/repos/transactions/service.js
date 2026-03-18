import { TransactionsRepository, } from "./repository/index.js";
import { PairsRepository } from "./../pairs/index.js";
// ============================================================
// SERVICE
// ============================================================
export class TransactionsService {
    repo;
    pairsRepo;
    r;
    constructor(config) {
        this.r = new TransactionsRepository(config.db);
        this.repo = new TransactionsRepository(config.db);
        this.pairsRepo = new PairsRepository(config.db);
    }
    // ─────────────────────────────────────────────
    // SCHEMA
    // ─────────────────────────────────────────────
    async initSchema() {
        await this.repo.initSchema();
    }
    async applyPotentialIndexes() {
        await this.repo.createPotentialIndexes();
    }
    // ─────────────────────────────────────────────
    // INSERT (canonical entrypoint)
    // ─────────────────────────────────────────────
    /**
     * Idempotent insert with pair linkage.
     * Returns existing id on conflict.
     */
    async insertTransactions(params) {
        // ONE semaphore
        console.log('insertTransactions', params);
        const insertedId = await this.repo.insertAndReturnId(params);
        if (insertedId !== null) {
            return insertedId;
        }
        // Conflict path only
        const existing = await this.repo.fetchBySignature(params.signature);
        if (!existing) {
            throw new Error(`insertTransactions(): conflict but row missing: ${params.signature}`);
        }
        return existing.id;
    }
    /**
     * Batch insert with conflict handling.
     * Returns map of signature → id.
     */
    async insertTransactionsBatch(paramsList) {
        const ids = await this.repo.insertBatch(paramsList);
        const result = new Map();
        for (let i = 0; i < paramsList.length; i++) {
            if (ids[i]) {
                result.set(paramsList[i].signature, ids[i]);
            }
        }
        return result;
    }
    // ─────────────────────────────────────────────
    // FETCH - by identity
    // ─────────────────────────────────────────────
    async fetchById(id) {
        return await this.repo.fetchById(id);
    }
    async fetchBySignature(signature) {
        return await this.repo.fetchBySignature(signature);
    }
    async fetchByPair(pairId) {
        return await this.repo.fetchByPair(pairId);
    }
    async fetchByMint(mint) {
        return await this.repo.fetchByMint(mint);
    }
    // ─────────────────────────────────────────────
    // FETCH - by user
    // ─────────────────────────────────────────────
    async fetchByUser(userAddress, limit = 1000) {
        return await this.repo.fetchByUser(userAddress, limit);
    }
    async fetchByUserAndPair(userAddress, pairId) {
        return await this.repo.fetchByUserAndPair(userAddress, pairId);
    }
    async fetchUserHistory(userAddress, options) {
        if (options?.pairId) {
            return await this.repo.fetchByUserAndPair(userAddress, options.pairId);
        }
        return await this.repo.fetchByUser(userAddress, options?.limit ?? 1000);
    }
    // ─────────────────────────────────────────────
    // FETCH - by creator
    // ─────────────────────────────────────────────
    async fetchByCreator(creator, limit = 1000) {
        return await this.repo.fetchByCreator(creator, limit);
    }
    // ─────────────────────────────────────────────
    // FETCH - pagination
    // ─────────────────────────────────────────────
    async fetchLatest(limit = 100) {
        return await this.repo.fetchLatest(limit);
    }
    async fetchOldest(limit = 100) {
        return await this.repo.fetchOldest(limit);
    }
    async fetchPageByPair(pairId, cursor) {
        return await this.repo.fetchPageByPair(pairId, cursor);
    }
    async fetchPageByUser(userAddress, cursor) {
        return await this.repo.fetchPageByUser(userAddress, cursor);
    }
    // ─────────────────────────────────────────────
    // FETCH - time range
    // ─────────────────────────────────────────────
    async fetchByPairInRange(pairId, range) {
        return await this.repo.fetchByPairInRange(pairId, range);
    }
    async fetchByUserInRange(userAddress, range) {
        return await this.repo.fetchByUserInRange(userAddress, range);
    }
    // ─────────────────────────────────────────────
    // EXISTS (fast path)
    // ─────────────────────────────────────────────
    async exists(signature) {
        return await this.repo.existsBySignature(signature);
    }
    async existsById(id) {
        return await this.repo.existsById(id);
    }
    // ─────────────────────────────────────────────
    // AGGREGATES
    // ─────────────────────────────────────────────
    async countByPair(pairId) {
        return await this.repo.countByPair(pairId);
    }
    async countByUser(userAddress) {
        return await this.repo.countByUser(userAddress);
    }
    async getVolumeByPair(pairId) {
        return await this.repo.sumVolumeByPair(pairId);
    }
    async getVolumeByUser(userAddress) {
        return await this.repo.sumVolumeByUser(userAddress);
    }
    // ─────────────────────────────────────────────
    // ROLLUPS (materialized aggregates)
    // ─────────────────────────────────────────────
    async refreshPairRollup(pairId) {
        const volume = await this.repo.sumVolumeByPair(pairId);
        if (!volume) {
            return null;
        }
        await this.repo.upsertPairRollup(pairId, volume.total_sol_volume, volume.total_token_volume);
        return await this.repo.fetchPairRollup(pairId);
    }
    async getPairRollup(pairId) {
        return await this.repo.fetchPairRollup(pairId);
    }
    async sumVolumeByUser(userAddress) {
        return await this.repo.sumVolumeByUser(userAddress);
    }
    async sumVolumeByPair(pairId) {
        return await this.repo.sumVolumeByPair(pairId);
    }
    // ─────────────────────────────────────────────
    // CREATOR BATCHING (temp table pattern)
    // ─────────────────────────────────────────────
    // add directly in the class
    async fetchByIds(ids) {
        return await this.repo.fetchByIds(ids);
    }
    ;
    async fetchCreatorAccountIdsBySignatures(signatures) {
        if (signatures.length === 0) {
            return [];
        }
        await this.repo.bulkInsertTmpCreatorSignatures(signatures);
        return await this.repo.fetchCreatorAccountIds();
    }
}
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================
export function createTransactionsService(config) {
    return new TransactionsService(config);
}
