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

import type {
  LogOrchestratorConfig,
  EnrichmentDeps,
  EnrichmentRepos,
} from './src/enricher/enrichment-deps.js';
import {
  makeLazyPublisher,
  createLogDataService,
  createLogDataRepository,
  createLogPayloadService,
  createLogPayloadRepository,
  createMetaDataService,
  createMetaDataRepository,
  createPairsService,
  createPairsRepository,
  createTransactionsService,
  createTransactionsRepository,
  createSignaturesService,
  createSignaturesRepository
} from './src/enricher/enrichment-deps.js';
import { bindRepo, type DatabaseApp, type QueuePublisher } from '@imports';
import type { DecoderRegistry } from '@imports';
import * as events from './src/events/index.js';
import * as logs from './src/logs/index.js';
import * as payloads from './src/payloads/index.js';
import * as transactions from './src/transactions/index.js';
import * as enrich from './src/enricher/index.js';
import * as pairs from './src/pairs/index.js';


// ============================================================
// BINDINGS — method mixins, same pattern as repos
// ============================================================

export type LogOrchestratorBindings = 
  & typeof logs
  & typeof payloads
  & typeof transactions
  & typeof pairs
  & typeof events
  & typeof enrich
export interface LogOrchestrator extends LogOrchestratorBindings {}


// ============================================================
// ORCHESTRATOR
// ============================================================

export class LogOrchestrator {
  constructor(readonly cfg: LogOrchestratorConfig) {
    bindRepo(this, {
      logs,
      payloads,
      transactions,
      pairs,
      events
    },
  );
  }

  // ── enrichmentDeps: matches the second EnrichmentDeps declaration ──
  // (logDataService, logPayloadService, metaDataService, pairsService, transactionsService)
  get enrichmentDeps(): EnrichmentDeps {
    return {
      logDataService:       this.cfg.logDataService,
      logPayloadService:    this.cfg.logPayloadService,
      metaDataService:      this.cfg.metaDataService,
      pairsService:         this.cfg.pairsService,
      transactionsService:  this.cfg.transactionsService,
    };
  }

  // ── enrichmentRepos: matches the second EnrichmentRepos declaration ──
  // (logDataRepository, logPayloadRepository, metaDataRepository,
  //  pairsRepository, transactionsRepository)
  get enrichmentRepos(): EnrichmentRepos {
    return {
      logDataRepository:       this.cfg.logDataRepository,
      logPayloadRepository:    this.cfg.logPayloadRepository,
      metaDataRepository:      this.cfg.metaDataRepository,
      pairsRepository:         this.cfg.pairsRepository,
      transactionsRepository:  this.cfg.transactionsRepository,
    };
  }
}


// ============================================================
// FACTORY CONFIG — everything that createLogOrchestrator needs
// ============================================================

export interface LogOrchestratorFactoryConfig {
  app:             DatabaseApp;
  decoderRegistry: DecoderRegistry;
  publisher?:      QueuePublisher;   // defaults to lazy proxy
}


// ============================================================
// FACTORY — fully typed, no `any`, no hidden resolution
// ============================================================

export function createLogOrchestrator(
  factoryConfig: LogOrchestratorFactoryConfig
): LogOrchestrator {
  const { app, decoderRegistry } = factoryConfig;

  // Publisher defaults to the lazy proxy so boot order doesn't matter.
  // Callers can inject a real publisher for testing or explicit wiring.
  const publisher = factoryConfig.publisher ?? makeLazyPublisher();

  // ── Repositories ─────────────────────────────────────────────
  const logDataRepository        = createLogDataRepository(app.db);
  const logPayloadRepository     = createLogPayloadRepository(app.db);
  const metaDataRepository       = createMetaDataRepository(app.db);
  const pairsRepository          = createPairsRepository(app.db);
  const transactionsRepository   = createTransactionsRepository(app.db);
  const signaturesRepository     = createSignaturesRepository(app.db);

  // ── Services ─────────────────────────────────────────────────
  const logDataService       = createLogDataService(app);
  const logPayloadService    = createLogPayloadService(app);
  const metaDataService      = createMetaDataService(app);
  const pairsService         = createPairsService(app);
  const transactionsService  = createTransactionsService(app);
  const signaturesService    = createSignaturesService(app);



  // ── Assemble — matches LogOrchestratorConfig exactly ─────────
  const cfg: LogOrchestratorConfig = {
    // Repositories
    logDataRepository,
    logPayloadRepository,
    metaDataRepository,
    pairsRepository,
    transactionsRepository,
    signaturesRepository,

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