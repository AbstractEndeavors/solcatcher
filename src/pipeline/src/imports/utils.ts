export function camelToScreamingSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toUpperCase();
}
export function jsonSafeStringify(value: unknown, maxLen?: number): string {
  const str = JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
  return maxLen ? str.slice(0, maxLen) : str;
}
