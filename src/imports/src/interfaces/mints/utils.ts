import type { MintLike } from './imports.js';

/* -------------------------------------------------- */
/* Validation primitive                               */
/* -------------------------------------------------- */

const BASE58_MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidMint(value: string): boolean {
  return BASE58_MINT_RE.test(value.trim());
}

/* -------------------------------------------------- */
/* Core — everything else funnels through here        */
/* -------------------------------------------------- */

const DEFAULT_MINT_FIELDS = ['mint', 'mintAddress', 'mint_address'] as const;

export function normalizeMintFields(
  input: unknown,
  fields: string | string[] = DEFAULT_MINT_FIELDS as unknown as string[]
): string | null {
  // bare string — validate directly
  if (typeof input === 'string') {
    const s = input.trim();
    return isValidMint(s) ? s : null;
  }
  if (input && typeof input === 'object') {
    const keys = Array.isArray(fields) ? fields : [fields];
    for (const key of keys) {
      const raw = (input as any)[key];
      if (typeof raw === 'string') {
        const s = raw.trim();
        if (isValidMint(s)) return s;
      }
    }
  }
  return null;
}

/* -------------------------------------------------- */
/* All other helpers delegate — no re-implementation  */
/* -------------------------------------------------- */

export function normalizeMint(value: unknown): string | null {
  return normalizeMintFields(value);
}

export function isMint(value: unknown): value is MintLike {
  return normalizeMintFields(value) !== null;
}

export function isMintArray(value: unknown): value is MintLike[] {
  return Array.isArray(value) && value.length > 0 && value.every(isMint);
}

export const isMints = isMintArray;

export function firstNormalizedMint(...values: unknown[]): string | null {
  for (const v of values) {
    const m = normalizeMintFields(v);
    if (m != null) return m;
  }
  return null;
}

export function extractMint(
  value: { mint?: unknown } | null | undefined
): string | null {
  return normalizeMintFields(value);
}

export const getMintOrNull = extractMint;