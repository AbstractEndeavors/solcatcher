import e from 'express';
import {DepsInitializer} from './../initialize.js';
const deps_mgr = new DepsInitializer()
const deps = await deps_mgr.start();
function unwrap<T>(res: RepoResult<T>): T | null {
  return res.ok ? res.value : null;
}

export async function pairsEnrichment() {
  const pairsRepo = deps.pairsRepo;
  const latest = await pairsRepo.fetchCursor({ limit: 1 });
  const rows = latest.ok ? latest.value : [];

  for (const row of rows) {
    const result = await pairsRepo.assureIdentityEnrich(row);

    if (!result.ok) {
      console.warn('pair enrich error', result.reason, result.meta);
      continue;
    }

    const {
      id: pair_id,
      needsEnrich,
      enrichType,
      row: pair,
    } = result.value;

    if (needsEnrich) {
      console.log('pair needs enrich', pair_id, enrichType);
    }
  }
}
export async function metaEnrichment() {
  const metaDataRepo = deps.metaDataRepo;
  const latest = await metaDataRepo.fetchCursor({ limit: 1 });
  const rows = latest.ok ? latest.value : [];

  for (const row of rows) {
    const result = await metaDataRepo.assureIdentityEnrich(row);

    if (!result.ok) {
      console.warn('meta enrich error', result.reason, result.meta);
      continue;
    }

    const {
      id: meta_id,
      needsEnrich,
      enrichType,
      row: meta,
    } = result.value;

    // 🔥 meta is fully typed MetaDataRow
    if (needsEnrich) {
      console.log('meta needs enrich', meta_id, enrichType);
    }
  }
}
await metaEnrichment()
await pairsEnrichment()