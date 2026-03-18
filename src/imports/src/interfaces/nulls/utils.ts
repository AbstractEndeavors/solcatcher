export function firstOrNull<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}
export function emptyObjectToNull<T>(v: T | null | undefined): T | null {
  return v == null ? null : v;
}