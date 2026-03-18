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
import { makeLazyPublisher, createLogDataService, createLogDataRepository, createLogPayloadService, createLogPayloadRepository, createMetaDataService, createMetaDataRepository, createPairsService, createPairsRepository, createTransactionsService, createTransactionsRepository, createSignaturesService, createSignaturesRepository } from './src/enricher/enrichment-deps.js';
import { bindRepo } from '@imports';
import * as src from './src/index.js';
// ============================================================
// ORCHESTRATOR
// ============================================================
export class LogOrchestrator {
    cfg;
    constructor(cfg) {
        this.cfg = cfg;
        bindRepo(this, src);
    }
    // ── enrichmentDeps: matches the second EnrichmentDeps declaration ──
    // (logDataService, logPayloadService, metaDataService, pairsService, transactionsService)
    get enrichmentDeps() {
        return {
            logDataService: this.cfg.logDataService,
            logPayloadService: this.cfg.logPayloadService,
            metaDataService: this.cfg.metaDataService,
            pairsService: this.cfg.pairsService,
            transactionsService: this.cfg.transactionsService,
        };
    }
    // ── enrichmentRepos: matches the second EnrichmentRepos declaration ──
    // (logDataRepository, logPayloadRepository, metaDataRepository,
    //  pairsRepository, transactionsRepository)
    get enrichmentRepos() {
        return {
            logDataRepository: this.cfg.logDataRepo,
            logPayloadRepository: this.cfg.logPayloadRepo,
            metaDataRepository: this.cfg.metaDataRepo,
            pairsRepository: this.cfg.pairsRepo,
            transactionsRepository: this.cfg.transactionsRepo,
        };
    }
}
// ============================================================
// FACTORY — fully typed, no `any`, no hidden resolution
// ============================================================
export async function createLogOrchestrator(factoryConfig) {
    const { app, decoderRegistry } = factoryConfig;
    // Publisher defaults to the lazy proxy so boot order doesn't matter.
    // Callers can inject a real publisher for testing or explicit wiring.
    const publisher = factoryConfig.publisher ?? makeLazyPublisher();
    // ── Repositories ─────────────────────────────────────────────
    const logDataRepo = createLogDataRepository(app.db);
    const logPayloadRepo = createLogPayloadRepository(app.db);
    const metaDataRepo = createMetaDataRepository(app.db);
    const pairsRepo = createPairsRepository(app.db);
    const transactionsRepo = createTransactionsRepository(app.db);
    const signaturesRepo = createSignaturesRepository(app);
    // ── Services ─────────────────────────────────────────────────
    const logDataService = createLogDataService(app);
    const logPayloadService = createLogPayloadService(app);
    const metaDataService = createMetaDataService(app);
    const pairsService = createPairsService(app);
    const transactionsService = createTransactionsService(app);
    const signaturesService = createSignaturesService(app);
    // ── Assemble — matches LogOrchestratorConfig exactly ─────────
    const cfg = {
        // Repositories
        logDataRepo,
        logPayloadRepo,
        metaDataRepo,
        pairsRepo,
        transactionsRepo,
        signaturesRepo,
        // Services
        logDataService,
        logPayloadService,
        metaDataService,
        pairsService,
        transactionsService,
        signaturesService,
        // Decoder
        decoderRegistry,
        // Publisher (explicit or lazy proxy)
        publisher,
    };
    return new LogOrchestrator(cfg);
}
