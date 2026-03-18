/**
 * Wrapper for database operations with semaphore
 */
import { ConnectionSemaphore } from './connection.js';
export async function withSemaphore(semaphore, operation) {
    const release = await semaphore.acquire();
    try {
        return await operation();
    }
    finally {
        release();
    }
}
