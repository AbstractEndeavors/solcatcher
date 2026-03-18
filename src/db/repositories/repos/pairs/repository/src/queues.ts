import type { QueuePublisher } from '@pipeline';
import { PairsRepository } from '../PairsRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike} from '@imports';

export async function tryClaimSlot(
  this: PairsRepository,
  id: IdLike
): Promise<boolean> {
  const res = await this.db.query(QueryRegistry.CLAIM_SLOT, [id]);
  return res.rows.length > 0;
}

export async function releaseSlot(
  this: PairsRepository,
  id: IdLike
): Promise<void> {
  await this.db.query(QueryRegistry.RELEASE_SLOT, [id]);
}

export async function reapStale(
  this: PairsRepository
): Promise<void> {
  await this.db.query(QueryRegistry.REAP_STALE);
}