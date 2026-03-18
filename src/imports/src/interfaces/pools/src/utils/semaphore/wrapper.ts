/**
 * Wrapper for database operations with semaphore
 */
import {ConnectionSemaphore} from './connection.js';
export async function withSemaphore<T>(
  semaphore: ConnectionSemaphore,
  operation: () => Promise<T>
): Promise<T> {
  const release = await semaphore.acquire();

  try {
    return await operation();
  } finally {
    release();
  }
}
