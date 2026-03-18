/**
 * ENRICHMENT DEPS
 *
 * Explicit dependency bag for enrichment functions.
 *
 * Before: every enricher called getRepoServices.repos() / .services()
 *         internally — hidden globals, untestable, untraceable.
 *
 * After:  the orchestrator builds EnrichmentDeps once and threads it
 *         through every enricher call. Same repos, no magic.
 *
 * Pattern: Explicit environment wiring over "smart defaults"
 */
import { 
  type DatabaseClient
} from "@db";
import { 
  createLogDataService,
  createLogDataRepository,
  LogDataRepository,
  LogDataService
} from '@repositories/logdata/index.js';
import { 
  createLogPayloadService,
  createLogPayloadRepository,
  LogPayloadRepository,
  LogPayloadService
} from '@repositories/payloads/index.js';
import { 
  createMetaDataService,
  MetaDataService,
  createMetaDataRepository,
  MetaDataRepository} from '@repositories/metadata/index.js';
import { 
  createPairsService,
  PairsService,
  createPairsRepository,
  PairsRepository,
} from '@repositories/pairs/index.js';
import {
   createTransactionsRepository,
   createTransactionsService,
   TransactionsRepository,
   TransactionsService
  } from '@repositories/transactions/index.js';
import { 
  createSignaturesService,
  createSignaturesRepository,
  SignaturesRepository,
  SignaturesService
} from '@repositories/signatures/index.js';

import {
  RateLimiterService,
  createRateLimiterService
} from '@repositories/ratelimiter/index.js'
import { 
  createLogOrchestrator,
  LogOrchestrator
 } from "@repositories/workflows/LogOrchestrator.js";
import type {
  DatabaseApp,
  DecoderRegistry,
  QueuePublisher
} from '@decoder';
import { getPublisher } from "@Pipeline/src/transport/publisher.js";

/* -------------------------------------------------- */
/* Lazy publisher proxy                               */
/*                                                    */
/* Defers getPublisher() to the moment publish() is   */
/* actually called — not when services() runs.        */
/* Eliminates boot-order coupling entirely.           */
/* -------------------------------------------------- */

export function makeLazyPublisher(): QueuePublisher {
  return {
    publish: (queue, payload) => getPublisher().publish(queue, payload),
    publishBatch: (queue, payloads) => getPublisher().publishBatch(queue, payloads),
  };
}



/* -------------------------------------------------- */
/* Interfaces                                         */
/* -------------------------------------------------- */

export interface Repositories {
  pairsRepository: PairsRepository;
  metaDataRepository: MetaDataRepository;
  transactionsRepository: TransactionsRepository;
  logPayloadRepository: LogPayloadRepository;
  logDataRepository: LogDataRepository;
  signaturesRepository: SignaturesRepository;
}

export interface Services {
  logPayloadService: LogPayloadService;
  signaturesService: SignaturesService;
  pairsService: PairsService;
  metaDataService: MetaDataService;
  transactionsService: TransactionsService;
  logDataService: LogDataService;
}

export interface Orchistrators {
  logOrchestrator: LogOrchestrator;
}

export interface Limiters {
  rateLimiter: RateLimiterService;
}
export interface Decoders {
  decoderRegistry: DecoderRegistry;
}
export interface Publisher {
  publisher: QueuePublisher;
}

export interface RepoServiceDeps extends Repositories, Services {
}
export interface RepoServiceLimiterDeps extends RepoServiceDeps,Limiters {
}
export interface RepoServiceLimiterDecoderDeps extends RepoServiceLimiterDeps,Decoders {
}
export interface RepoServiceLimiterDecoderPublisherDeps extends RepoServiceLimiterDecoderDeps,Publisher {
}
export interface RepoServiceLimiterDecoderPublisherOrchistratorDeps extends RepoServiceLimiterDecoderPublisherDeps,Orchistrators {
}
export interface AllDeps extends Repositories, Services, Orchistrators, Limiters, Decoders {
}
export interface PipelineDeps extends Repositories, Services, Orchistrators,Limiters {
}
export interface OrchistratorDeps extends Repositories, Services, Limiters, Decoders  {


}
/* -------------------------------------------------- */
/* Internal memoized state                            */
/* -------------------------------------------------- */

interface CreateServices {
  logPayloadService: ReturnType<typeof createLogPayloadService>;
  transactionsService: ReturnType<typeof createTransactionsService>;
  logDataService: ReturnType<typeof createLogDataService>;
  metaDataService: ReturnType<typeof createMetaDataService>;
  pairsService: ReturnType<typeof createPairsService>;
  signaturesService: ReturnType<typeof createSignaturesService>;
  logOrchestrator: ReturnType<typeof createLogOrchestrator>;
}

interface CreateRepositories {
  rateLimiter: Awaited<ReturnType<typeof createRateLimiterService>>;
  logPayloadRepository: ReturnType<typeof createLogPayloadRepository>;
  logDataRepository: ReturnType<typeof createLogDataRepository>;
  metaDataRepository: ReturnType<typeof createMetaDataRepository>;
  pairsRepository: ReturnType<typeof createPairsRepository>;
  transactionsRepository: ReturnType<typeof createTransactionsRepository>;
  signaturesRepository: ReturnType<typeof createSignaturesRepository>;
}

let db: DatabaseClient;
let repos: CreateRepositories;
let services: CreateServices;
let orchids: any | null = null;
let app: DatabaseApp;
// ============================================================
// CONFIG — every dependency is named, typed, visible
// ============================================================

export interface LogOrchestratorConfig extends Repositories, Services, Decoders, Publisher {
}
// ============================================================
// REPOS — raw data access, no business logic
// ============================================================
export interface EnrichmentRepos {
  readonly logDataRepository: LogDataRepository;
  readonly logPayloadRepository: LogPayloadRepository;
  readonly metaDataRepository: MetaDataRepository;
  readonly pairsRepository: PairsRepository;
  readonly transactionsRepository: TransactionsRepository;
}
// ============================================================
// DEPS — repos + services + side-effect channels
// ============================================================

export interface EnrichmentDeps {
  readonly logDataService: LogDataService;
  readonly logPayloadService: LogPayloadService;
  readonly metaDataService: MetaDataService;
  readonly pairsService: PairsService;
  readonly transactionsService: TransactionsService;
}
export { 
  createLogDataService,
  createLogDataRepository,createLogPayloadService,
  createLogPayloadRepository,
  createPairsRepository,createTransactionsRepository,
   createTransactionsService,createSignaturesService,
  createSignaturesRepository,createRateLimiterService,
  createMetaDataRepository,createMetaDataService,
  createPairsService
 }