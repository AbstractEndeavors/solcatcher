// src/pipeline/transport/publisher.ts
//
// DESIGN: Lazy initialization — no boot ordering contract.
//
// The old pattern required initPublisher() to be awaited before any
// code path that calls getPublisher() could run. With multiple entry
// points (pipeline bootstrap, HTTP server, etc.) that contract is
// invisible and breaks silently.
//
// New pattern:
//   1. registerConnectionManager(cm) — sync, cheap, call it early.
//      Just stores the CM reference. No channels, no rabbit calls.
//   2. getPublisher() — always succeeds if CM was registered.
//      Returns the same singleton instance. No throw.
//   3. publish() — lazily creates channel + asserts queue on first use,
//      per queue. Idempotent after that.
//
// Bootstrap compat: initPublisher() still exists as an async warm-up
// path if you want eager channel validation at startup. It is no longer
// a prerequisite for anything.

import type { Channel } from 'amqplib';
import type { ConnectionManager } from './connection.js';
import { 
  type QueueName, 
  type QueuePayloadMap, 
  type IQueuePublisher,
  QueueConfigs,
  jsonSafeStringify,
} from './imports.js';
export class QueuePublisher implements IQueuePublisher {
  private channel: Channel | null = null;
  private readonly assertedQueues = new Set<string>();

  constructor(private readonly connectionManager: ConnectionManager) {}

  private async ensureChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = await this.connectionManager.getChannel('publisher', 1);
    }
    return this.channel;
  }

  private async ensureQueue(envKey: string): Promise<void> {
    if (this.assertedQueues.has(envKey)) return;
    const channel = await this.ensureChannel();
    await channel.assertQueue(envKey, { durable: true });
    this.assertedQueues.add(envKey);
  }

  async publish<T extends QueueName>(
    queue: T,
    payload: QueuePayloadMap[T]
  ): Promise<void> {
    const config = QueueConfigs[queue];
    await this.ensureQueue(config.envKey);
    const channel = await this.ensureChannel();
    const content = Buffer.from(jsonSafeStringify(payload));
    channel.sendToQueue(config.envKey, content, { persistent: true });
  }

  async publishBatch<T extends QueueName>(
    queue: T,
    payloads: QueuePayloadMap[T][]
  ): Promise<void> {
    for (const payload of payloads) {
      await this.publish(queue, payload);
    }
  }

  /** Optional: eager warm-up — assert all queues at startup. */
  async warmUp(): Promise<void> {
    await Promise.all(
      Object.values(QueueConfigs).map(config => this.ensureQueue(config.envKey))
    );
  }

  async teardown(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
    this.assertedQueues.clear();
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────────────────────────

let publisherInstance: QueuePublisher | null = null;

/**
 * Sync. Registers the ConnectionManager and creates the singleton.
 * No rabbit calls happen here — safe to call before anything is up.
 * Call this as early as possible in every entry point.
 */
export function registerConnectionManager(connectionManager: ConnectionManager): QueuePublisher {
  if (!publisherInstance) {
    publisherInstance = new QueuePublisher(connectionManager);
  }
  return publisherInstance;
}

/**
 * Returns the publisher singleton.
 * Throws only if registerConnectionManager was never called.
 */
export function getPublisher(): QueuePublisher {
  if (!publisherInstance) {
    throw new Error(
      'No ConnectionManager registered — call registerConnectionManager(cm) at entry point startup before importing anything that uses getPublisher()'
    );
  }
  return publisherInstance;
}

/**
 * Bootstrap compat: registers CM and warms up all queues.
 * Use in pipeline bootstrap if you want eager validation.
 * No longer a prerequisite for getPublisher().
 */
export async function initPublisher(connectionManager: ConnectionManager): Promise<QueuePublisher> {
  const publisher = registerConnectionManager(connectionManager);
  await publisher.warmUp();
  return publisher;
}


