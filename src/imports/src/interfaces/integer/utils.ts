
import type {IntLike} from './imports.js';
import type {PositiveInt} from './types.js';
import {isObject} from './imports.js'
// ============================================================
// ID/SIGNATURE TYPES
// ============================================================
export function normalizePositiveInt(value: unknown): IntLike {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    if (!/^\d+$/.test(value)) return null;
    const n = Number(value);
    return n > 0 ? n : null;
  }

  return null;
}
export function toPositiveInt(value: unknown): PositiveInt | null {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
      ? Number(value)
      : null;

  if (n === null) return null;
  if (!Number.isInteger(n) || n <= 0) return null;

  return n as PositiveInt;
}
export function isPositive(value: unknown): value is PositiveInt {
  return toPositiveInt(value) !== null;
}
function applyNumberBounds(
  value: number,
  field: string,
  opts?: { min?: number; max?: number }
): number {
  if (opts?.min !== undefined && value < opts.min) {
    throw new Error(`${field} < ${opts.min}`);
  }
  if (opts?.max !== undefined && value > opts.max) {
    throw new Error(`${field} > ${opts.max}`);
  }
  return value;
}
export function normalizeNumber(
  input: unknown,
  fields: string | string[],
  opts?: { min?: number; max?: number }
): number {
  const keys = Array.isArray(fields) ? fields : [fields];

  // ─────────────────────────────
  // Fast path: already a number
  // ─────────────────────────────
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new Error(`Invalid number`);
    }
    return applyNumberBounds(input, keys[0], opts);
  }

  let n: number | null = null;

  // ─────────────────────────────
  // String input
  // ─────────────────────────────
  if (typeof input === "string" && input.trim()) {
    n = Number(input);
  }

  // ─────────────────────────────
  // Object input: try all fields
  // ─────────────────────────────
  else if (isObject(input)) {
    for (const key of keys) {
      const v = (input as any)[key];
      if (typeof v === "number") {
        n = v;
        break;
      }
      if (typeof v === "string" && v.trim()) {
        n = Number(v);
        break;
      }
    }
  }

  if (n === null || !Number.isFinite(n)) {
    throw new Error(`Invalid ${keys.join(" | ")}`);
  }

  return applyNumberBounds(n, keys[0], opts);
}
