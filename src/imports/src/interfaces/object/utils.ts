export function isObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null;
}
