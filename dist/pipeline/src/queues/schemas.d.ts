import type { QueueName, QueuePayloadMap } from './definitions.js';
/**
 * Validation result - either success with data or failure with details
 */
export type ValidationResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    field: string;
    reason: string;
    value: unknown;
};
/**
 * Enhanced validator that returns detailed errors
 */
export type EnhancedValidator<T> = (x: unknown) => ValidationResult<T>;
export declare const EnhancedValidators: {
    [K in QueueName]: EnhancedValidator<QueuePayloadMap[K]>;
};
export declare function validatePayloadEnhanced<T extends QueueName>(queue: T, payload: unknown): QueuePayloadMap[T];
export declare const PayloadValidators: {
    [K in QueueName]: PayloadValidator<QueuePayloadMap[K]>;
};
export declare function validatePayload<T extends QueueName>(queue: T, payload: unknown): QueuePayloadMap[T];
