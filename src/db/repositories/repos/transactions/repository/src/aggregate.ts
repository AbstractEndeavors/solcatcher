// ─────────────────────────────────────────────
// AGGREGATES
// ─────────────────────────────────────────────
import { QueryRegistry } from "./../../query-registry.js";
import {TransactionsRepository} from './../TransactionsRepository.js';
import type {IdLike,AddressLike,VolumeAggregate} from '@imports';

  export async function countByPair(
    this: TransactionsRepository,
    pairId: IdLike): Promise<number> {
    const res = await this.db.query<{ count: string }>(
      QueryRegistry.COUNT_BY_PAIR,
      [pairId]
    );
    return parseInt(res.rows[0]?.count ?? "0", 10);
  }
  export async function countByUser(
    this: TransactionsRepository,
    userAddress: AddressLike): Promise<number> {
    const res = await this.db.query<{ count: string }>(
      QueryRegistry.COUNT_BY_USER,
      [userAddress]
    );
    return parseInt(res.rows[0]?.count ?? "0", 10);
  }
  export async function sumVolumeByPair(
    this: TransactionsRepository,
    pairId: IdLike
    ): Promise<VolumeAggregate | null> {
    const res = await this.db.query<VolumeAggregate>(
      QueryRegistry.SUM_VOLUME_BY_PAIR,
      [pairId]
    );
    return res.rows[0] ?? null;
  }
  export async function sumVolumeByUser(
    this: TransactionsRepository,
    userAddress: AddressLike
    ): Promise<VolumeAggregate | null> {
    const res = await this.db.query<VolumeAggregate>(
      QueryRegistry.SUM_VOLUME_BY_USER,
      [userAddress]
    );
    return res.rows[0] ?? null;
  }
