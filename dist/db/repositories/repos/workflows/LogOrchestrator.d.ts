/**
 * LOG ORCHESTRATOR
 *
 * Top-level coordinator for the log→decode→classify→enrich→persist lifecycle.
 *
 * Updated to match expanded enrichment-deps.ts interfaces:
 *   - LogOrchestratorConfig extends RepoServiceLimiterDecoderPublisherDeps
 *     (Repositories + Services + Limiters + Decoders + Publisher)
 *   - createLogOrchestrator fully typed — no `any`, no implicit `app`
 *   - enrichmentDeps / enrichmentRepos getters match the second (canonical)
 *     interface declarations in enrichment-deps.ts
 *   - makeLazyPublisher() used for boot-order safety
 *
 * Pattern: Explicit environment wiring — every dependency is visible
 *          in the constructor signature.
 */
import type { LogOrchestratorConfig, EnrichmentDeps, EnrichmentRepos } from './src/enricher/enrichment-deps.js';
import { type DatabaseApp, type QueuePublisher } from '@imports';
import type { DecoderRegistry } from '@imports';
import * as src from './src/index.js';
export type LogOrchestratorBindings = typeof src;
export interface LogOrchestrator extends LogOrchestratorBindings {
}
export declare class LogOrchestrator {
    readonly cfg: LogOrchestratorConfig;
    constructor(cfg: LogOrchestratorConfig);
    get enrichmentDeps(): EnrichmentDeps;
    get enrichmentRepos(): EnrichmentRepos;
}
export interface LogOrchestratorFactoryConfig {
    app: DatabaseApp;
    decoderRegistry: DecoderRegistry;
    publisher?: QueuePublisher;
}
export declare function createLogOrchestrator(factoryConfig: LogOrchestratorFactoryConfig): Promise<LogOrchestrator>;
