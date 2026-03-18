/**
 * METADATA PIPELINE
 *
 * Clean, maintainable TypeScript architecture following:
 * - Registries over globals
 * - Schemas over ad-hoc objects
 * - Explicit environment wiring
 */
// ============================================================
// CORE EXPORTS
// ============================================================
export * from './service.js';
export { MetaDataRepository, createMetaDataRepository } from './repository/index.js';
// ============================================================
// SCHEMAS
// ============================================================
// ============================================================
// REGISTRIES
// ============================================================
export { QueryRegistry } from './query-registry.js';
