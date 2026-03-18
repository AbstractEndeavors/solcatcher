// ─────────────────────────────────────────────
// FETCH - by user
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import {TransactionsRepository} from './../../TransactionsRepository.js';
import type {TransactionsRow,IdLike,AddressLike,LimitLike} from '@imports';
export async function fetchByUser(
  this: TransactionsRepository,
    userAddress: AddressLike,
    limit: LimitLike = 1000
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_USER,
      [userAddress, limit]
    );
    return res.rows;
  }
export async function fetchByUserAndPair(
  this: TransactionsRepository,
    userAddress: AddressLike,
    pairId: IdLike
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_USER_AND_PAIR,
      [userAddress, pairId]
    );
    return res.rows;
  }

  // ─────────────────────────────────────────────
  // FETCH - by creator
  // ─────────────────────────────────────────────
export async function fetchByCreator(
  this: TransactionsRepository,
    creator: AddressLike,
    limit: LimitLike = 1000
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_CREATOR,
      [creator, limit]
    );
    return res.rows;
  }
