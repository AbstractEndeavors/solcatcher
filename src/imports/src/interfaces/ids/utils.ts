import type {IdLike} from './imports.js';
import {isPositive,extractRow,normalizeNumber,emptyObjectToNull} from './imports.js';
export function isIdArray(value: unknown): value is IdLike[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(isId)
  );
}

export const isId = isPositive;
export const isIds = isIdArray;
export function normalizeId(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value && "id" in value) {
    const id = (value as any).id;
    return typeof id === "number" ? id : null;
  }
  return null;
}
export function firstNormalizedId(...values: unknown[]): number | null {
  for (const v of values) {
    if (v == null) continue;

    if (typeof v === "number" && Number.isInteger(v)) return v;

    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isInteger(n)) return n;
    }

    if (typeof v === "object") {
      const obj = v as any;
      const nested =
        obj.id ?? obj.log_id ?? obj.logId;
      const n = firstNormalizedId(nested);
      if (n != null) return n;
    }
  }

  return null;
}
export function extractId(
  value: { id?: unknown } | null | undefined
): number | null {
  return typeof value?.id === 'number' ? value.id : null;
}

export function getNonEmptyNormalizedId(
  obj: unknown
): IdLike | null {
  const id = normalizeId(obj);
  return typeof id === 'number' && id > 0 ? id : null;
}
export function getIdOrNull(
  value: { id?: unknown } | null | undefined
): number | null {
  return typeof value?.id === 'number' ? value.id : null;
}

export function normalizeIdFields(
  input: unknown,
  fields: string[] | string = "id"
): number | null {
  const n = normalizeNumber(input, fields, { min: 1 });
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}