export function ensureArray<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : x ? [x] : [];
}
