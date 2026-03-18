import { PairsRepository } from "./repository/index.js";
import { SOLANA_PUMP_FUN_PROGRAM_ID } from '@imports';
import type {
  DatabaseClient, MintLike, IdLike, AddressLike,
  RepoResult, LimitLike, PairRow
} from '@imports';

export interface PairsServiceConfig { db: DatabaseClient; }
export interface CursorId { created_at: Date; id: IdLike; }

export class PairsService {
  private readonly repo: PairsRepository;

  constructor(config: PairsServiceConfig) {
    this.repo = new PairsRepository(config.db);
  }

  async start(): Promise<void> {
    await this.repo.createTable();
  }

  // ─────────────────────────────────────────────
  // BATCH FETCH / ASSURE
  // ─────────────────────────────────────────────

  async fetchBatchByMints(
    mints: MintLike[],
    program_ids: AddressLike[]
  ): Promise<RepoResult<PairRow[]>> {
    const rows: PairRow[] = [];
    const seen = new Set<IdLike>();
    let fallback_program_id: AddressLike = SOLANA_PUMP_FUN_PROGRAM_ID;

    for (let i = 0; i < mints.length; i++) {
      const mint = mints[i];
      const program_id = program_ids[i] ?? fallback_program_id;
      if (program_ids[i]) fallback_program_id = program_ids[i];

      const identResult = await this.repo.assureIdentity({ mint, program_id });
      if (!identResult.ok || identResult.value == null) return { ...identResult, value: null };
      
      const id = identResult.value;
      if (seen.has(id)) continue;
      seen.add(id);

      const fetchResult = await this.repo.fetchById(id);
      if (!fetchResult.ok) return { ...fetchResult, value: null };
      if (fetchResult.value) rows.push(fetchResult.value);
    }

    return { ok: true, value: rows };
  }

  // ─────────────────────────────────────────────
  // TRANSACTION INDEXING
  // ─────────────────────────────────────────────


  /**
   * Append one or more transaction IDs to a pair.
   * Guarantees append-only behavior.
   */
  async appendTransactions(
    pairId: number,
    txnIds: number[] | number
  ): Promise<RepoResult<PairRow>> {
    const ids = Array.isArray(txnIds) ? txnIds : [txnIds];

    if (!ids.length) {
      const pair = await this.repo.fetchById(pairId);
      if (!pair?.value) throw new Error("appendTransactions(): pair not found");
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
  // LIFECYCLE
  // ─────────────────────────────────────────────
  async markProcessed(pairId: number): Promise<RepoResult<PairRow>> {
    const results = await this.repo.fetchById(pairId);
    if (!results.value) {
      throw new Error("markProcessed(): pair not found");
    }

    if (results.value.processed_at) return results;

    // Simple explicit update (inline — no repository pollution)
    await this.repo["db"].query(
      `
      UPDATE pairs
      SET processed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1;
      `,
      [pairId]
    );

    const updated = await this.repo.fetchById(pairId);
    if (!updated) {
      throw new Error("markProcessed(): failed to reload pair");
    }

    return updated;
  }

  // ─────────────────────────────────────────────
  // CURSOR PAGINATION
  // ─────────────────────────────────────────────

  async getCursorPage(params: {
    limit: LimitLike;
    cursor?: CursorId;
  }): Promise<RepoResult<{
    items: PairRow[];
    next_cursor: CursorId | null;
    has_more: boolean;
  }>> {
    const result = await this.repo.fetchCursor({
      limit: params.limit,
      cursor_created_at: params.cursor?.created_at,
      cursor_id: params.cursor?.id,
    });

    if (!result.ok) return { ...result, value: null };

    const items = result.value ?? [];
    const last = items.at(-1);
    const next_cursor = last ? { created_at: last.created_at, id: last.id } : null;

    return {
      ok: true,
      value: {
        items,
        next_cursor,
        has_more: items.length === params.limit,
      },
    };
  }


}

export function createPairsService(config: PairsServiceConfig): PairsService {
  return new PairsService(config);
}