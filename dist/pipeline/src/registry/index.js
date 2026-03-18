// src/pipeline/registry/index.ts
// ═══════════════════════════════════════════════════════════════════
// THE ONE REGISTRY - TIES EVERYTHING TOGETHER
// ═══════════════════════════════════════════════════════════════════
import { QueueConfigs, getAllQueueNames } from '../queues/registry.js';
import { PayloadValidators, validatePayload } from './../queues/schemas.js';
// Re-export everything from queues
export * from '../queues/definitions.js';
export * from '../queues/schemas.js';
export * from '../queues/registry.js';
// ────────────────────────────────────────────────────────
// PIPELINE REGISTRY
// ────────────────────────────────────────────────────────
class PipelineRegistry {
    handlers = new Map();
    initialized = false;
    // ─────────────────────────────────────────────
    // CONFIG ACCESS
    // ─────────────────────────────────────────────
    getConfig(name) {
        return QueueConfigs[name];
    }
    getAllConfigs() {
        return Object.values(QueueConfigs);
    }
    // ─────────────────────────────────────────────
    // VALIDATOR ACCESS
    // ─────────────────────────────────────────────
    getValidator(name) {
        return PayloadValidators[name];
    }
    validate(name, payload) {
        return validatePayload(name, payload);
    }
    // ─────────────────────────────────────────────
    // HANDLER REGISTRATION
    // ─────────────────────────────────────────────
    registerHandler(name, handler) {
        if (this.handlers.has(name)) {
            throw new Error(`Handler already registered for queue: ${name}`);
        }
        this.handlers.set(name, handler);
    }
    registerHandlers(handlers) {
        for (const [name, handler] of Object.entries(handlers)) {
            if (handler) {
                this.registerHandler(name, handler);
            }
        }
    }
    getHandler(name) {
        return this.handlers.get(name);
    }
    hasHandler(name) {
        return this.handlers.has(name);
    }
    // ─────────────────────────────────────────────
    // FULL ENTRY ACCESS
    // ─────────────────────────────────────────────
    getEntry(name) {
        return {
            config: this.getConfig(name),
            validator: this.getValidator(name),
            handler: this.getHandler(name),
        };
    }
    // ─────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────
    markInitialized() {
        const missingHandlers = [];
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
    isInitialized() {
        return this.initialized;
    }
    // ─────────────────────────────────────────────
    // DEBUG
    // ─────────────────────────────────────────────
    getStatus() {
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
