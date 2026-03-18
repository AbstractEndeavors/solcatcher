import type { QueueName, QueueConfig, QueueHandler, PayloadValidator, QueuePayloadMap } from '../queues/definitions.js';
export * from '../queues/definitions.js';
export * from '../queues/schemas.js';
export * from '../queues/registry.js';
export interface RegistryEntry<T extends QueueName> {
    config: QueueConfig<T>;
    validator: PayloadValidator<QueuePayloadMap[T]>;
    handler: QueueHandler<T> | null;
}
declare class PipelineRegistry {
    private handlers;
    private initialized;
    getConfig<T extends QueueName>(name: T): QueueConfig<T>;
    getAllConfigs(): QueueConfig<QueueName>[];
    getValidator<T extends QueueName>(name: T): PayloadValidator<QueuePayloadMap[T]>;
    validate<T extends QueueName>(name: T, payload: unknown): QueuePayloadMap[T];
    registerHandler<T extends QueueName>(name: T, handler: QueueHandler<T>): void;
    registerHandlers(handlers: Partial<{
        [K in QueueName]: QueueHandler<K>;
    }>): void;
    getHandler<T extends QueueName>(name: T): QueueHandler<T> | null;
    hasHandler(name: QueueName): boolean;
    getEntry<T extends QueueName>(name: T): RegistryEntry<T>;
    markInitialized(): void;
    isInitialized(): boolean;
    getStatus(): {
        initialized: boolean;
        queues: {
            name: QueueName;
            hasHandler: boolean;
            hasWorker: boolean;
        }[];
    };
}
export declare const Registry: PipelineRegistry;
