/**
 * Wrapper for database operations with semaphore
 */
import { ConnectionSemaphore } from './connection.js';
export declare function withSemaphore<T>(semaphore: ConnectionSemaphore, operation: () => Promise<T>): Promise<T>;
