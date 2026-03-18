// src/pipeline/queues/registry.ts
// ═══════════════════════════════════════════════════════════════════
// QUEUE CONFIGURATIONS - WITH SELECTIVE ENABLE/DISABLE
// ═══════════════════════════════════════════════════════════════════

import { type QueueName,camelToScreamingSnake } from './../imports/index.js';
import {allQueueNames} from './queueConfigs.js';

// ────────────────────────────────────────────────────────
// ENVIRONMENT LOADING
// ────────────────────────────────────────────────────────
/**
 * Parse enable flags from environment.
 * 
 * Supports:
 *   PIPELINE_QUEUES=logIntake,logEntry,txnEntry  (whitelist)
 *   PIPELINE_QUEUES=all                          (enable all)
 *   PIPELINE_QUEUES=none                         (disable all)
 *   QUEUE_LOG_INTAKE_ENABLED=false               (per-queue override)
 *   WORKER_PAIR_ENRICH_ENABLED=false             (per-worker override)
 */
export function parseEnableFlags(): {
  queues: Set<QueueName> | 'all' | 'none';
  queueOverrides: Map<QueueName, boolean>;
  workerOverrides: Map<QueueName, boolean>;
} {
  const pipelineQueues = process.env.PIPELINE_QUEUES?.trim().toLowerCase();
  let queues: Set<QueueName> | 'all' | 'none' = 'all';

  if (pipelineQueues === 'none') {
    queues = 'none';
  } else if (pipelineQueues && pipelineQueues !== 'all') {
    const names = pipelineQueues.split(',').map(s => s.trim()) as QueueName[];
    queues = new Set(names);
  }

  const queueOverrides = new Map<QueueName, boolean>();
  const workerOverrides = new Map<QueueName, boolean>();



  for (const name of allQueueNames) {
    const queueEnvKey = `QUEUE_${camelToScreamingSnake(name)}_ENABLED`;
    const queueEnvVal = process.env[queueEnvKey];
    if (queueEnvVal !== undefined) {
      queueOverrides.set(name, queueEnvVal.toLowerCase() === 'true');
    }

    const workerEnvKey = `WORKER_${camelToScreamingSnake(name)}_ENABLED`;
    const workerEnvVal = process.env[workerEnvKey];
    if (workerEnvVal !== undefined) {
      workerOverrides.set(name, workerEnvVal.toLowerCase() === 'true');
    }
  }

  return { queues, queueOverrides, workerOverrides };
}

