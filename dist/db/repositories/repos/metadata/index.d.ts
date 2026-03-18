/**
 * METADATA PIPELINE
 *
 * Clean, maintainable TypeScript architecture following:
 * - Registries over globals
 * - Schemas over ad-hoc objects
 * - Explicit environment wiring
 */
export * from './service.js';
export { MetaDataRepository, createMetaDataRepository } from './repository/index.js';
export { QueryRegistry } from './query-registry.js';
export type { MetaDataServiceConfig } from './service.js';
