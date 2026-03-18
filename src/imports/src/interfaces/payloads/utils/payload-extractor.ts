import type { LogPayloadBatchItem } from './../schemas.js';
import { type SigLike,initializeRegistry } from './imports.js';

// Singleton — no need to rebuild per payload
const REGISTRY = initializeRegistry();

// ============================================================
// EXTRACT PAYLOADS (recursive tree walk)
// ============================================================

function normalizeEvent(log?: string): string | null {
  if (!log) return null;
  return log
    .replace('Instruction:', '')
    .replace('Program log:', '')
    .trim();
}
export function extractProgramIds(
  parsedLogs: any[]
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  function walk(node: any) {
    const pid = node?.program_id;
    if (typeof pid === 'string' && pid.length > 0 && !seen.has(pid)) {
      seen.add(pid);
      ordered.push(pid);
    }

    for (const child of node?.children ?? []) {
      walk(child);
    }
  }

  for (const root of parsedLogs ?? []) {
    walk(root);
  }

  return ordered;
}
export function getEffectiveProgramId(
  node: any,
  parentProgram?: string
): string | null {
  if (typeof node?.program_id === 'string') {
    return node.program_id;
  }
  return parentProgram ?? null;
}
export function extractProgramIdsFromLogLines(
  logLines: string[]
): string[] {
  const re = /^Program\s+([1-9A-HJ-NP-Za-km-z]{32,44})\s+(invoke|success)/;
  const seen = new Set<string>();
  const out: string[] = [];

  for (const line of logLines) {
    const m = re.exec(line);
    if (m && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }

  return out;
}
/**
 * Recursively walk an invocation node and its children,
 * emitting a LogPayloadBatchItem for every `Program data:` entry.
 */
export function extractPayloads(
  node: any,
  signature: SigLike,
  out: LogPayloadBatchItem[],
  parentProgram?: string,
  parentEvent?: string | null
): void {
  const logs: string[] = node.logs ?? [];
  const event = logs.length ? normalizeEvent(logs[0]) : parentEvent;

  for (const b64 of node.data ?? []) {
    const raw = Buffer.from(b64, 'base64');
    const disc = raw.subarray(0, 8).toString('hex');

    // unified is a Map<string, UnifiedEntry> — .has() is the right check
    const decodable = REGISTRY.unified.has(disc);

    out.push({
      signature,
      program_id: node.program_id,
      discriminator: disc,
      payload_len: raw.length - 8,
      event,
      depth: node.depth ?? 0,
      invocation_index: node.invocation_index,
      reported_invocation: node.reported_invocation ?? null,
      parent_program_id: parentProgram ?? null,
      parent_event: parentEvent ?? null,
      decodable,
      b64,
    });
  }

  for (const child of node.children ?? []) {
    extractPayloads(child, signature, out, node.program_id, event);
  }
}

// ============================================================
// PROCESS PARSED LOGS → LogPayloadBatchItem[]
// ============================================================

/**
 * Entry point: convert the output of parseProgramLogs() into
 * a flat array of payload rows ready for batch insert.
 *
 * parsedLogs is InvocationRecord[] — multiple roots (e.g.
 * SystemProgram, PumpFun CreateV2, AToken, PumpFun BuyExactSolIn).
 * A virtual root wraps them so extractPayloads visits every one.
 */
export function processParsedLogs(
  signature: SigLike,
  parsedLogs: any[]
): LogPayloadBatchItem[] {
  if (!parsedLogs?.length) return [];

  const payloads: LogPayloadBatchItem[] = [];

  const virtualRoot = {
    program_id: '__root__',
    logs: [],
    data: [],
    depth: -1,
    invocation_index: -1,
    reported_invocation: null,
    children: parsedLogs,
  };

  extractPayloads(virtualRoot, signature, payloads);
  return payloads;
}
