import { TransactionsRepository } from "./TransactionsRepository.js";
import type { DatabaseClient } from "./../../types.js";
export declare function createTransactionsRepository(db: DatabaseClient): TransactionsRepository;
export { TransactionsRepository };
export type { DatabaseClient };
