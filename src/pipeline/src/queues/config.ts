import { QueueConfigs } from "./queueConfigs.js";
import { parseEnableFlags } from "./environment.js";
import { type QueueName, type QueueConfig } from './../imports/index.js';
const enableFlags = parseEnableFlags();
// ────────────────────────────────────────────────────────
// ENABLE/DISABLE LOGIC
// ────────────────────────────────────────────────────────

export function isQueueEnabled(name: QueueName): boolean {
  if (!QueueConfigs[name]) return false;   // unknown name → treat as disabled
  if (enableFlags.queueOverrides.has(name)) {
    return enableFlags.queueOverrides.get(name)!;
  }
  if (enableFlags.queues === 'none') return false;
  if (enableFlags.queues === 'all') return QueueConfigs[name].enabled;
  return enableFlags.queues.has(name);
}

export function isWorkerEnabled(name: QueueName): boolean {
  if (!QueueConfigs[name].worker) return false;
  if (enableFlags.workerOverrides.has(name)) {
    return enableFlags.workerOverrides.get(name)!;
  }
  return isQueueEnabled(name);
}

// ────────────────────────────────────────────────────────
// GETTERS
// ────────────────────────────────────────────────────────

export function getQueueConfig<T extends QueueName>(name: T): QueueConfig<T> {
  return QueueConfigs[name];
}

export function getAllQueueNames(): QueueName[] {
  return Object.keys(QueueConfigs) as QueueName[];
}

export function getEnabledQueueNames(): QueueName[] {
  return getAllQueueNames().filter(isQueueEnabled);
}

export function getEnabledWorkerNames(): QueueName[] {
  return getAllQueueNames().filter(isWorkerEnabled);
}

export function getQueuesWithWorkers(): QueueName[] {
  return getAllQueueNames().filter(name => QueueConfigs[name].worker);
}

// ────────────────────────────────────────────────────────
// STATUS / DEBUG
// ────────────────────────────────────────────────────────

export function getQueueStatus(): {
  name: QueueName;
  enabled: boolean;
  workerEnabled: boolean;
  hasWorker: boolean;
}[] {
  return getAllQueueNames().map(name => ({
    name,
    enabled: isQueueEnabled(name),
    workerEnabled: isWorkerEnabled(name),
    hasWorker: !!QueueConfigs[name].worker,
  }));
}

export function logQueueStatus(): void {
  const status = getQueueStatus();

  console.log({
    logType: 'info',
    message: 'Queue configuration',
    details: {
      enabledQueues: status.filter(s => s.enabled).map(s => s.name),
      enabledWorkers: status.filter(s => s.workerEnabled).map(s => s.name),
      disabledQueues: status.filter(s => !s.enabled).map(s => s.name),
    }
  });
}
