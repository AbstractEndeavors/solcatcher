// src/db/repositories/repos/transactions/service.ts
//
// UPDATED: Split write path (staging) from read path (mega).
//
// insertTransactions / insertTransactionsBatch → staging DB (active side)
// All reads, exists, aggregates                 → mega DB
//
// stagingDb is injected — the caller resolves it via loadStagingEnv()
// before constructing the service. This keeps the registry query
// out of the hot insert path (resolve once per pipeline start,
// or per drain swap event — not per row).

import { TransactionsRepository } from "./repository/index.js";
import { PairsRepository } from "./../pairs/index.js";
import type {
  DatabaseClient,
  IdLike,
  SigLike,
  AddressLike,
  MintLike,
  TransactionsInsertParams,
  TransactionsRow,
  VolumeAggregate,
  PairRollup,
  TimeRange,
  PaginationCursor,
} from "@imports";

// ============================================================
// CONFIG
// ============================================================

export interface TransactionsServiceConfig {
  db: DatabaseClient;        // mega — reads, exists, aggregates
  stagingDb: DatabaseClient; // staging — writes only
}

// ============================================================
// SERVICE
// ============================================================

export class TransactionsService {
  private readonly repo: TransactionsRepository;        // mega
  private readonly stagingRepo: TransactionsRepository; // staging
  private readonly pairsRepo: PairsRepository;
  readonly r: TransactionsRepository;

  constructor(config: TransactionsServiceConfig) {
    this.repo        = new TransactionsRepository(config.db);
    this.stagingRepo = new TransactionsRepository(config.stagingDb);
    this.pairsRepo   = new PairsRepository(config.db);
    this.r           = this.repo;
  }

  // ─────────────────────────────────────────────
  // SCHEMA
  // ─────────────────────────────────────────────

  async initSchema(): Promise<void> {
    await this.repo.initSchema();
  }

  async applyPotentialIndexes(): Promise<void> {
    await this.repo.createPotentialIndexes();
  }

  // ─────────────────────────────────────────────
  // INSERT — writes to staging, not mega
  // ─────────────────────────────────────────────

  /**
   * Fast path: insert into active staging DB.
   * No dedup check here — dedup enforced at drain time (mega boundary).
   * Returns null on conflict within staging (rare but handled).
   */
  async insertTransactions(params: TransactionsInsertParams): Promise<IdLike> {
    const insertedId = await this.stagingRepo.insertAndReturnId(params);

    if (insertedId !== null) {
      return insertedId;
    }

    // Conflict within staging — signature already staged, not yet drained.
    // Return a sentinel rather than doing an expensive fetch.
    // Caller (processTradeEvent) only uses the id for genesisLookup —
    // which is idempotent, so a null-sentinel is safe.
    const existing = await this.stagingRepo.fetchBySignature(params.signature);
    if (!existing) {
      throw new Error(
        `insertTransactions(): staging conflict but row missing: ${params.signature}`
      );
    }

    return existing.id;
  }

  /**
   * Batch insert into staging.
   */
  async insertTransactionsBatch(
    paramsList: TransactionsInsertParams[]
  ): Promise<Map<SigLike, IdLike>> {
    const ids = await this.stagingRepo.insertBatch(paramsList);

    const result = new Map<SigLike, IdLike>();
    for (let i = 0; i < paramsList.length; i++) {
      if (ids[i]) {
        result.set(paramsList[i].signature, ids[i]);
      }
    }

    return result;
  }

  // ─────────────────────────────────────────────
  // FETCH — reads from mega
  // ─────────────────────────────────────────────

  async fetchById(id: IdLike): Promise<TransactionsRow | null> {
    return await this.repo.fetchById(id);
  }

  async fetchBySignature(signature: SigLike): Promise<TransactionsRow | null> {
    return await this.repo.fetchBySignature(signature);
  }

  async fetchByPair(pairId: IdLike): Promise<TransactionsRow[]> {
    return await this.repo.fetchByPair(pairId);
  }

  async fetchByMint(mint: MintLike): Promise<TransactionsRow[]> {
    return await this.repo.fetchByMint(mint);
  }

  async fetchByUser(
    userAddress: AddressLike,
    limit: number = 1000
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchByUser(userAddress, limit);
  }

  async fetchByUserAndPair(
    userAddress: AddressLike,
    pairId: IdLike
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchByUserAndPair(userAddress, pairId);
  }

  async fetchUserHistory(
    userAddress: AddressLike,
    options?: { limit?: number; pairId?: IdLike }
  ): Promise<TransactionsRow[]> {
    if (options?.pairId) {
      return await this.repo.fetchByUserAndPair(userAddress, options.pairId);
    }
    return await this.repo.fetchByUser(userAddress, options?.limit ?? 1000);
  }

  async fetchByCreator(
    creator: AddressLike,
    limit: number = 1000
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchByCreator(creator, limit);
  }

  async fetchLatest(limit: number = 100): Promise<TransactionsRow[]> {
    return await this.repo.fetchLatest(limit);
  }

  async fetchOldest(limit: number = 100): Promise<TransactionsRow[]> {
    return await this.repo.fetchOldest(limit);
  }

  async fetchPageByPair(
    pairId: IdLike,
    cursor: PaginationCursor
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchPageByPair(pairId, cursor);
  }

  async fetchPageByUser(
    userAddress: AddressLike,
    cursor: PaginationCursor
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchPageByUser(userAddress, cursor);
  }

  async fetchByPairInRange(
    pairId: IdLike,
    range: TimeRange
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchByPairInRange(pairId, range);
  }

  async fetchByUserInRange(
    userAddress: AddressLike,
    range: TimeRange
  ): Promise<TransactionsRow[]> {
    return await this.repo.fetchByUserInRange(userAddress, range);
  }

  async fetchByIds(ids: IdLike[]): Promise<TransactionsRow[]> {
    return await this.repo.fetchByIds(ids);
  }

  // ─────────────────────────────────────────────
  // EXISTS — reads from mega
  // ─────────────────────────────────────────────

  async exists(signature: SigLike): Promise<boolean> {
    return await this.repo.existsBySignature(signature);
  }

  async existsById(id: IdLike): Promise<boolean> {
    return await this.repo.existsById(id);
  }

  // ─────────────────────────────────────────────
  // AGGREGATES — reads from mega
  // ─────────────────────────────────────────────

  async countByPair(pairId: IdLike): Promise<number> {
    return await this.repo.countByPair(pairId);
  }

  async countByUser(userAddress: AddressLike): Promise<number> {
    return await this.repo.countByUser(userAddress);
  }

  async getVolumeByPair(pairId: IdLike): Promise<VolumeAggregate | null> {
    return await this.repo.sumVolumeByPair(pairId);
  }

  async getVolumeByUser(userAddress: AddressLike): Promise<VolumeAggregate | null> {
    return await this.repo.sumVolumeByUser(userAddress);
  }

  // ─────────────────────────────────────────────
  // ROLLUPS — mega
  // ─────────────────────────────────────────────

  async refreshPairRollup(pairId: IdLike): Promise<PairRollup | null> {
    const volume = await this.repo.sumVolumeByPair(pairId);
    if (!volume) return null;

    await this.repo.upsertPairRollup(
      pairId,
      volume.total_sol_volume,
      volume.total_token_volume
    );

    return await this.repo.fetchPairRollup(pairId);
  }

  async getPairRollup(pairId: IdLike): Promise<PairRollup | null> {
    return await this.repo.fetchPairRollup(pairId);
  }

  async sumVolumeByUser(userAddress: AddressLike): Promise<VolumeAggregate | null> {
    return await this.repo.sumVolumeByUser(userAddress);
  }

  async sumVolumeByPair(pairId: IdLike): Promise<VolumeAggregate | null> {
    return await this.repo.sumVolumeByPair(pairId);
  }

  // ─────────────────────────────────────────────
  // CREATOR BATCHING — mega
  // ─────────────────────────────────────────────

  async fetchCreatorAccountIdsBySignatures(
    signatures: SigLike[]
  ): Promise<IdLike[]> {
    if (signatures.length === 0) return [];
    await this.repo.bulkInsertTmpCreatorSignatures(signatures);
    return await this.repo.fetchCreatorAccountIds();
  }
}

// ============================================================
// FACTORY
// ============================================================

export function createTransactionsService(
  config: TransactionsServiceConfig
): TransactionsService {
  return new TransactionsService(config);
}

// ============================================================
// RE-EXPORTS
// ============================================================

export type {
  TransactionsInsertParams,
  TransactionsRow,
  VolumeAggregate,
  PairRollup,
  TimeRange,
  PaginationCursor,
};
