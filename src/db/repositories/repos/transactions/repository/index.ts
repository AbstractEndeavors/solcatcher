import {
  TransactionsRepository,
} from "./TransactionsRepository.js";
import type { DatabaseClient } from "./../../types.js";

// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================

export function createTransactionsRepository(
  db: DatabaseClient
): TransactionsRepository {
  return new TransactionsRepository(db);
}

// ============================================================
// RE-EXPORTS
// ============================================================

export { TransactionsRepository };
export type {
  DatabaseClient
};
