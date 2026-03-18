// ─────────────────────────────────────────────
// FETCH - time range
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../../query-registry.js";
import {TransactionsRepository} from './../../TransactionsRepository.js';
import type {TransactionsRow,IdLike,AddressLike,TimeRange,} from '@imports';

  export async function fetchByPairInRange(
    this: TransactionsRepository,
    pairId: IdLike,
    range: TimeRange
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_PAIR_IN_RANGE,
      [pairId, range.start, range.end]
    );
    return res.rows;
  }

  export async function fetchByUserInRange(
    this: TransactionsRepository,
    userAddress: AddressLike,
    range: TimeRange
  ): Promise<TransactionsRow[]> {
    const res = await this.db.query<TransactionsRow>(
      QueryRegistry.FETCH_BY_USER_IN_RANGE,
      [userAddress, range.start, range.end]
    );
    return res.rows;
  }

