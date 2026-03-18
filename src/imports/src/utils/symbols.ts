export function normalizeSymbol(v?: string | null) {
  return v && v.trim() !== '' ? v : null;
}
