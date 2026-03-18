import {getSafeLength,decodeStringB64,encodeDataB64,type Base64String} from './imports.js';
import type {RepoResult} from './schemas.js';
export function normalizeLogId(input: unknown): number | null {
  if (typeof input === "number") return input;
  if (input && typeof input === "object" && typeof (input as any).id === "number") {
    return (input as any).id;
  }
  return null;
}
export function logsContain(
  logs: unknown,
  needle: string
): boolean {
  if (!Array.isArray(logs)) return false

  for (const line of logs) {
    if (typeof line === 'string' && line.includes(needle)) {
      return true
    }
  }
  return false
}
export function parsedLogsContain(
  logs: unknown,
  needle: string
): boolean {
  if (!Array.isArray(logs)) return false

  for (const entry of logs) {
    if (
      entry &&
      typeof entry === "object" &&
      Array.isArray((entry as any).logs)
    ) {
      for (const line of (entry as any).logs) {
        if (typeof line === "string" && line.includes(needle)) {
          return true
        }
      }
    }
  }
  return false
}
export function flattenInvocations(
  invocations: any[],
  out: any[] = []
): any[] {
  for (const inv of invocations) {
    out.push(inv);
    if (getSafeLength(inv.children)) {
      flattenInvocations(inv.children, out);
    }
  }
  return out;
}
export function flattenInvocationsWithData(
  invocations: unknown,
  out: any[] = []
): any[] {
  if (!Array.isArray(invocations)) return out;

  for (const inv of invocations) {
    if (Array.isArray(inv?.data) && inv.data.length > 0) {
      out.push(inv);
    }

    if (Array.isArray(inv?.children)) {
      flattenInvocationsWithData(inv.children, out);
    }
  }
  return out;
}


export function encodeLogsB64(logs: unknown): Base64String {
  return encodeDataB64(logs)
}

export function decodeLogsB64(b64: Base64String): unknown {
  return decodeStringB64(b64)
}
export function expectOk<T>(r: RepoResult<T>, context?: string): T {
  if (!r.ok) {
    const msg = context ? `${context}: ${r.reason}` : r.reason;
    
  }
  return r.value; // TypeScript knows value: T here — no null check needed
}

// Keep as alias for callers that use the longer name
export const expectRepoValue = expectOk;
