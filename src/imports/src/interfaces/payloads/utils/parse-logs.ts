import type {AddressLike,IntLike,LimitLike} from './imports.js';
import {InvocationRecord} from './imports.js'
/**
 * LOG PARSER (Pure functions + Regex registry)
 * 
 * Stateless parser using precompiled regex patterns.
 * No side effects, no mutation.
 */

// ============================================================
// PARSED LOG SCHEMAS
// ============================================================


// ============================================================
// REGEX REGISTRY (Precompiled patterns)
// ============================================================

const RegexRegistry = {
  INVOKE: /^Program\s+(\S+)\s+invoke\s+\[(\d+)\]/,
  SUCCESS: /^Program\s+(\S+)\s+success/,
  LOG: /^Program\s+log:\s+(.*)/,
  DATA: /^Program\s+data:\s+(.*)/,
  COMPUTE: /^Program\s+(\S+)\s+consumed\s+(\d+)\s+of\s+(\d+)\s+compute units/,
} as const;

// ============================================================
// PARSER STATE (Mutable during parsing, but local)
// ============================================================

interface ParserState {
  stack: MutableInvocation[];
  roots: MutableInvocation[];
  invocationIndex: number;
}

interface MutableInvocation {
  program_id: AddressLike;
  invocation_index: IntLike,
  depth: IntLike,
  
  logs: string[];
  data: string[];
  children: MutableInvocation[];
  reported_invocation?: IntLike;
  compute?:{ consumed: IntLike; limit: LimitLike }
}

// ============================================================
// PARSER (Pure function - no external state)
// ============================================================

export function parseProgramLogs(logs: string[]): InvocationRecord[] {
  const state: ParserState = {
    stack: [],
    roots: [],
    invocationIndex: 0,
  };

  for (const line of logs) {
    processLine(line, state);
  }

  // Convert mutable to immutable
  return state.roots.map(convertToImmutable);
}

// ──────────────────────────────────────────────────────
// LINE PROCESSORS (Registry-based dispatch)
// ──────────────────────────────────────────────────────

function processLine(line: string, state: ParserState): void {
  let match: RegExpMatchArray | null;

  // Try each pattern in order
  if ((match = RegexRegistry.INVOKE.exec(line))) {
    handleInvoke(match, state);
  } else if ((match = RegexRegistry.SUCCESS.exec(line))) {
    handleSuccess(match, state);
  } else if ((match = RegexRegistry.LOG.exec(line))) {
    handleLog(match, state);
  } else if ((match = RegexRegistry.DATA.exec(line))) {
    handleData(match, state);
  } else if ((match = RegexRegistry.COMPUTE.exec(line))) {
    handleCompute(match, state);
  }
}

// ──────────────────────────────────────────────────────
// HANDLERS (Pure state transformations)
// ──────────────────────────────────────────────────────

function handleInvoke(match: RegExpMatchArray, state: ParserState): void {
  const program_id = match[1];
  const reported = Number(match[2]);

  const invocation: MutableInvocation = {
    program_id,
    invocation_index: state.invocationIndex++,
    reported_invocation: reported,
    depth: state.stack.length,
    logs: [],
    data: [],
    children: [],
  };

  const parent = state.stack[state.stack.length - 1];
  if (parent) {
    parent.children.push(invocation);
  } else {
    state.roots.push(invocation);
  }

  state.stack.push(invocation);
}

function handleSuccess(match: RegExpMatchArray, state: ParserState): void {
  const program_id = match[1];
  const current = state.stack[state.stack.length - 1];

  if (current && current.program_id === program_id) {
    state.stack.pop();
  }
}

function handleLog(match: RegExpMatchArray, state: ParserState): void {
  const current = state.stack[state.stack.length - 1];
  if (current) {
    current.logs.push(match[1]);
  }
}

function handleData(match: RegExpMatchArray, state: ParserState): void {
  const current = state.stack[state.stack.length - 1];
  if (current) {
    current.data.push(match[1]);
  }
}

function handleCompute(match: RegExpMatchArray, state: ParserState): void {
  const program_id = match[1];
  const consumed = Number(match[2]);
  const limit = Number(match[3]);

  const current = state.stack[state.stack.length - 1];
  if (current && current.program_id === program_id) {
    current.compute = { consumed, limit };
  }
}

// ──────────────────────────────────────────────────────
// CONVERSION (Mutable → Immutable)
// ──────────────────────────────────────────────────────

function convertToImmutable(mut: MutableInvocation): InvocationRecord {
  return new InvocationRecord(
    mut.program_id,
    mut.invocation_index,
    mut.depth,
    mut.logs,
    mut.data,
    mut.children.map(convertToImmutable),
    mut.reported_invocation,
    mut.compute
  );
}
