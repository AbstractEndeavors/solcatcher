import { loadFetchConfig } from "./../../../envs/fetchConfig.js";
import { safeDivide } from "./../../../module_imports.js";
import {minutesSince} from './../../time/index.js';
import type {PairRow} from './../../pairs/index.js';
import type {MetaDataRow} from './../../metadata/index.js';
const META_DATA_INTERVAL_MINUTES = (() => {
  let raw:any
  const env = loadFetchConfig();
  raw = safeDivide(env.onchainMetaDataFetchInterval,60)
  const parsed = raw ? Number(raw) : 2;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid META_DATA_INTERVAL_MINUTES: ${raw}`
    );
  }

  return parsed;
})();
const SIGNATURE_INTERVAL_MINUTES = (() => {
  let raw:any
  const env = loadFetchConfig();
  raw = safeDivide(env.genesisSignatureFetchInterval,60)
  const parsed = raw ? Number(raw) : 2;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid SIGNATURE_INTERVAL_MINUTES: ${raw}`
    );
  }

  return parsed;
})();
// test helper only
export function shouldFetchMetaData(row: MetaDataRow): boolean {
  return !row.last_fetch || minutesSince(row.last_fetch) >= META_DATA_INTERVAL_MINUTES;
}
// test helper only
export function shouldFetchPairData(row: PairRow): boolean {
  return !row.last_fetch || minutesSince(row.last_fetch) >= SIGNATURE_INTERVAL_MINUTES;
}