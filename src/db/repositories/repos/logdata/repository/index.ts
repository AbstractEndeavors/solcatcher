import { LogDataRepository } from "./LogDataRepository.js";
import type { DatabaseClient } from '@imports';
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================

export function createLogDataRepository(
  db: DatabaseClient
): LogDataRepository {
  return new LogDataRepository(db);
}
export {LogDataRepository}
export type { DatabaseClient }
