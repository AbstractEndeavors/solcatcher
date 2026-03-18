export function extractData<T>(data: T | T[]): T {
  return Array.isArray(data) && data.length === 1 ? data[0] : data as any;
}
