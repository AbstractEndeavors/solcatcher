/**
 * DECODE PIPELINE
 *
 * Registry is injected at construction time via LogPayloadRepository,
 * not lazily initialized as a module-level singleton.
 *
 * The old `_registry` pattern was a global with extra steps — untestable,
 * implicit, and invisible to callers. Registry now flows from:
 *
 *   initializeRegistry() → LogPayloadRepository.registry → pipeline fns
 *
 * Nothing in this module initializes the registry itself.
 */

import {
  classifyPayloadBatch,
  classifyPayload,
  EventKind,
  partitionEvents,
  type ClassifiedEvent,
  type DecodeBatchResult,
  type PartitionedEvents,
} from '@imports';
import type {
  SigLike,
  IdLike,
  LogPayloadRow,
} from './imports.js';
import type { LogPayloadRepository } from './../LogPayloadRepository.js';

// ============================================================
// PIPELINE FUNCTIONS (bound to LogPayloadRepository via `this`)
// ============================================================

export async function decodeBySignature(
  this: LogPayloadRepository,
  signature: SigLike
): Promise<DecodeBatchResult> {
  const rows = await this.fetchBySignature(signature);
  return decodeRows(this, signature, rows);
}

export async function decodeById(
  this: LogPayloadRepository,
  id: IdLike
): Promise<ClassifiedEvent | null> {
  const row = await this.fetchById(id);
  if (!row) return null;
  // registry is now a property on the repo, not a module-level singleton
  return classifyPayload(row, this.registry);
}

/**
 * Decode pre-fetched rows — no DB call.
 *
 * Takes `repo` explicitly (not `this`) so it's callable as a free function
 * from service.decodeExisting without awkward .call() binding.
 */
export function decodeRows(
  repo: LogPayloadRepository,
  signature: SigLike,
  rows: LogPayloadRow[]
): DecodeBatchResult {
  const { events, skipped } = classifyPayloadBatch(rows, repo.registry);

  let trade_count = 0;
  let create_count = 0;
  let unknown_count = 0;

  for (const e of events) {
    switch (e.kind) {
      case EventKind.TRADE:  trade_count++;   break;
      case EventKind.CREATE: create_count++;  break;
      case EventKind.UNKNOWN: unknown_count++; break;
    }
  }

  return {
    signature,
    events,
    trade_count,
    create_count,
    unknown_count,
    skipped_count: skipped,
  };
}

export async function decodeAndPartition(
  this: LogPayloadRepository,
  signature: SigLike
): Promise<PartitionedEvents & { skipped: number }> {
  const batch = await decodeBySignature.call(this, signature);
  const partitioned = partitionEvents(batch.events);
  return { ...partitioned, skipped: batch.skipped_count };
}