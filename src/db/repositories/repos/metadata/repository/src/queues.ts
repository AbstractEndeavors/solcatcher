import { MetaDataRepository } from '../MetaDataRepository.js';
import { QueryRegistry } from './../../query-registry.js';
import type { IdLike} from '@imports';


export async function tryClaimSlot(
  this: MetaDataRepository,
  id: IdLike
): Promise<boolean> {
  const res = await this.db.query(QueryRegistry.CLAIM_SLOT, [id]);
  return res.rows.length > 0;
}

export async function releaseSlot(
  this: MetaDataRepository,
  id: IdLike
): Promise<void> {
  await this.db.query(QueryRegistry.RELEASE_SLOT, [id]);
}

export async function reaptale(
  this: MetaDataRepository
): Promise<void> {
  await this.db.query(QueryRegistry.REAP_STALE);
}