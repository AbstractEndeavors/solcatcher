import { TransactionsRepository, } from "./TransactionsRepository.js";
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================
export function createTransactionsRepository(db) {
    return new TransactionsRepository(db);
}
// ============================================================
// RE-EXPORTS
// ============================================================
export { TransactionsRepository };
