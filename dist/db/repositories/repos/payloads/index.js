/**
 * LOG PAYLOADS
 *
 * Clean architecture for log payload data management.
 *
 * Patterns:
 * - Schemas over ad-hoc objects
 * - Registries over globals
 * - Explicit wiring over smart defaults
 */
// ============================================================
// SERVICE (Primary API)
// ============================================================
export { LogPayloadService, createLogPayloadService } from './service.js';
// ============================================================
// REPOSITORY (Direct DB access if needed)
// ============================================================
export { LogPayloadRepository, createLogPayloadRepository } from './repository/index.js';
// ============================================================
// DECODE PIPELINE (NEW)
// ============================================================
// ============================================================
// REGISTRY
// ============================================================
export { QueryRegistry } from './query-registry.js';
export * from './payloadInsert.js';
