// src/pipeline/registry/index.ts
// ═══════════════════════════════════════════════════════════════════
// THE ONE REGISTRY - TIES EVERYTHING TOGETHER
// ═══════════════════════════════════════════════════════════════════
import {
    type QueueHandler,
    type QueueName,
    type QueuePayloadMap,
    type QueueConfig,
    type  PayloadValidator,
    validatePayloadEnhanced,
    EnhancedValidators
} from './imports/index.js';
import { getAllQueueNames,QueueConfigs } from './queues/index.js';
// ────────────────────────────────────────────────────────
// REGISTRY ENTRY
// ────────────────────────────────────────────────────────

export interface RegistryEntry<T extends QueueName> {
  config: QueueConfig<T>;
  validator: PayloadValidator<QueuePayloadMap[T]>;
  handler: QueueHandler<T> | null;
}

// ────────────────────────────────────────────────────────
// PIPELINE REGISTRY
// ────────────────────────────────────────────────────────

class PipelineRegistry {
  private handlers: Map<QueueName, QueueHandler<any>> = new Map();
  private initialized = false;

  // ─────────────────────────────────────────────
  // CONFIG ACCESS
  // ─────────────────────────────────────────────

  getConfig<T extends QueueName>(name: T): QueueConfig<T> {
    return QueueConfigs[name];
  }

  getAllConfigs(): QueueConfig<QueueName>[] {
    return Object.values(QueueConfigs);
  }

  // ─────────────────────────────────────────────
  // VALIDATOR ACCESS
  // ─────────────────────────────────────────────

  getValidator<T extends QueueName>(name: T): PayloadValidator<QueuePayloadMap[T]> {
    return EnhancedValidators[name];
  }

  validate<T extends QueueName>(name: T, payload: unknown): QueuePayloadMap[T] {
    return validatePayloadEnhanced(name, payload);
  }

  // ─────────────────────────────────────────────
  // HANDLER REGISTRATION
  // ─────────────────────────────────────────────

  registerHandler<T extends QueueName>(name: T, handler: QueueHandler<T>): void {
    if (this.handlers.has(name)) {
      throw new Error(`Handler already registered for queue: ${name}`);
    }
    this.handlers.set(name, handler);
  }

  registerHandlers(handlers: Partial<{ [K in QueueName]: QueueHandler<K> }>): void {
    
    for (const [name, handler] of Object.entries(handlers)) {
      if (handler) {
        this.registerHandler(name as any, handler as any);
      }
    }
  }

  getHandler<T extends QueueName>(name: T): QueueHandler<T> | null {
    return this.handlers.get(name) as QueueHandler<T> | null;
  }

  hasHandler(name: QueueName): boolean {
    return this.handlers.has(name);
  }

  // ─────────────────────────────────────────────
  // FULL ENTRY ACCESS
  // ─────────────────────────────────────────────

  getEntry<T extends QueueName>(name: T): RegistryEntry<T> {
    return {
      config: this.getConfig(name),
      validator: this.getValidator(name),
      handler: this.getHandler(name),
    };
  }

  // ─────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────

  markInitialized(): void {
    const missingHandlers: QueueName[] = [];

    for (const name of getAllQueueNames()) {
      if (!this.handlers.has(name)) {
        missingHandlers.push(name);
      }
    }

    if (missingHandlers.length > 0) {
      console.warn({
        logType: 'warn',
        message: 'Queues without handlers',
        details: { queues: missingHandlers }
      });
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // ─────────────────────────────────────────────
  // DEBUG
  // ─────────────────────────────────────────────

  getStatus(): {
    initialized: boolean;
    queues: { name: QueueName; hasHandler: boolean; hasWorker: boolean }[];
  } {
    return {
      initialized: this.initialized,
      queues: getAllQueueNames().map(name => ({
        name,
        hasHandler: this.handlers.has(name),
        hasWorker: !!QueueConfigs[name].worker,
      })),
    };
  }
}

// ────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ────────────────────────────────────────────────────────

export const Registry = new PipelineRegistry();
