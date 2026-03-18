import type {FetchUnsortedLimitParams,LimitLike} from './imports.js'
import {isPositive,normalizePositiveInt,normalizeBool} from './imports.js';
export const isLimit = isPositive;
export function normalizeFetchByLimitInput(
  a?: unknown,
  b?: unknown
): FetchUnsortedLimitParams {
  // defaults
  let limit: LimitLike = 100;
  let latest = false;

  // ─────────────────────────────────────────
  // CASE 1: dictionary/object input
  // ─────────────────────────────────────────
  if (a && typeof a === "object" && !Array.isArray(a)) {
    const obj = a as any;

    const l = normalizePositiveInt(obj.limit);
    const lt = normalizeBool(obj.latest);

    if (l !== null) limit = l;
    if (lt !== null) latest = lt;

    return { limit, latest };
  }

  // ─────────────────────────────────────────
  // CASE 2: positional inputs
  // ─────────────────────────────────────────
  const aLimit = normalizePositiveInt(a);
  const aBool  = normalizeBool(a);
  const bLimit = normalizePositiveInt(b);
  const bBool  = normalizeBool(b);

  // a = limit
  if (aLimit !== null) limit = aLimit;

  // a = latest
  if (aBool !== null && aLimit === null) latest = aBool;

  // b overrides
  if (bLimit !== null) limit = bLimit;
  if (bBool !== null) latest = bBool;

  return { limit, latest };
}
export function normalizeLimit(limit?: LimitLike): number | null {
  return isLimit(limit) ? Number(limit) : null;
}
