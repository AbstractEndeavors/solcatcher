import type { QueueHandler, QueueName } from '../queues/definitions.js';
import type { QueuePublisher } from '../transport/publisher.js';
import type { AllDeps } from '@repoServices';
export type HandlerMap = {
    [K in QueueName]?: QueueHandler<K>;
};
/**
 * Create handlers only for specified queues
 */
export declare function createHandlersForQueues(deps: AllDeps, publisher: QueuePublisher, queues: QueueName[]): HandlerMap;
/**
 * Create all handlers
 */
export declare function createAllHandlers(deps: AllDeps, publisher: QueuePublisher): HandlerMap;
