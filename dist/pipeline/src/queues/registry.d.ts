import type { QueueName, QueueConfig } from './definitions.js';
export declare const QueueConfigs: {
    [K in QueueName]: QueueConfig<K>;
};
export declare function isQueueEnabled(name: QueueName): boolean;
export declare function isWorkerEnabled(name: QueueName): boolean;
export declare function getQueueConfig<T extends QueueName>(name: T): QueueConfig<T>;
export declare function getAllQueueNames(): QueueName[];
export declare function getEnabledQueueNames(): QueueName[];
export declare function getEnabledWorkerNames(): QueueName[];
export declare function getQueuesWithWorkers(): QueueName[];
export declare function getQueueStatus(): {
    name: QueueName;
    enabled: boolean;
    workerEnabled: boolean;
    hasWorker: boolean;
}[];
export declare function logQueueStatus(): void;
