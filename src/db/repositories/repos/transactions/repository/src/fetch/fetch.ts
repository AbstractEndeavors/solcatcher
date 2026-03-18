// ─────────────────────────────────────────────
// FETCH - pagination (cursor-based)
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import {TransactionsRepository} from './../../TransactionsRepository.js';
import type {TransactionsRow,IdLike,LimitLike,AddressLike,PaginationCursor} from '@imports';

export async function fetchLatest(
  this: TransactionsRepository,
     limit: LimitLike
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_LATEST,
      [limit]
    );
    return res.rows;
  }
export async function fetchOldest(
  this: TransactionsRepository,
     limit: LimitLike
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_OLDEST,
      [limit]
    );
    return res.rows;
  }
export async function fetchPageByPair(
  this: TransactionsRepository,
    pairId: IdLike,
    cursor: PaginationCursor
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_PAGE_BY_PAIR,
      [pairId, cursor.before, cursor.limit]
    );
    return res.rows;
  }
export async function fetchPageByUser(
  this: TransactionsRepository,
    userAddress: AddressLike,
    cursor: PaginationCursor
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_PAGE_BY_USER,
      [userAddress, cursor.before, cursor.limit]
    );
    return res.rows;
  }  // ─────────────────────────────────────────────
  // FETCH - pagination (cursor-based)
  // ─────────────────────────────────────────────

