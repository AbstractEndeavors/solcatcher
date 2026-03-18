import { LogDataRepository } from "./LogDataRepository.js";
// ============================================================
// FACTORY (Explicit environment wiring)
// ============================================================
export function createLogDataRepository(db) {
    return new LogDataRepository(db);
}
export { LogDataRepository };
