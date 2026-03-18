import type {BoolValue} from './imports.js';
export function normalizeBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;

  if (typeof v === "string") {
    if (v === "true") return true;
    if (v === "false") return false;
  }

  if (typeof v === "number") {
    if (v === 1) return true;
    if (v === 0) return false;
  }

  return null;
}
export function toBool(
  value: unknown,
  defaultValue: boolean = false
): boolean {
  const normalized = normalizeBool(value);
  return normalized ?? defaultValue;
}

export function isBool(value: unknown): value is BoolValue {
  return normalizeBool(value) !== null;
}
export function isBoolFalse(value: unknown): boolean {
  return normalizeBool(value) === false;
}

export function isTruthyBool(value: unknown): boolean {
  return normalizeBool(value) === true;
}

export function isFalsyBool(value: unknown): boolean {
  return normalizeBool(value) === false;
}
