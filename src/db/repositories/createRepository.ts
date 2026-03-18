// src/db/repositories/createRepositories.ts
//
// UPDATED: stagingDb threaded into TransactionsService write path only.
// Every other service stays on mega (db) untouched.

import {
  getDbApp,
  createDbClient,
  createDbApp,
} from "./../dbCreate/index.js";
import { type DatabaseClient,  getRateLimiterUrls } from "@imports";
import {
  createLogDataService,
  createLogDataRepository,
  LogDataRepository,
  LogDataService,
} from "./repos/logdata/index.js";
import {
  createLogPayloadService,
  createLogPayloadRepository,
  LogPayloadRepository,
  LogPayloadService,
} from "./repos/payloads/index.js";
import {
  createMetaDataService,
  MetaDataService,
  createMetaDataRepository,
  MetaDataRepository,
} from "./repos/metadata/index.js";
import {
  createPairsService,
  PairsService,
  createPairsRepository,
  PairsRepository,
} from "./repos/pairs/index.js";
import {
  createTransactionsRepository,
  createTransactionsService,
  TransactionsRepository,
  TransactionsService,
} from "./repos/transactions/index.js";
import {
  createSignaturesService,
  createSignaturesRepository,
  SignaturesRepository,
  SignaturesService,
} from "./repos/signatures/index.js";
import {PipelineCache} from './cache.js';
import { createLogOrchestrator, LogOrchestrator } from "./repos/workflows/LogOrchestrator.js";
import { RateLimiterService, createRateLimiterService } from "./repos/ratelimiter/index.js";
import { FetchManager } from "@rateLimiter";
import type { DatabaseApp, DecoderRegistry, QueuePublisher } from "@imports";
import { getPublisher } from "./../../pipeline/src/transport/publisher.js";
import { loadStagingEnv } from "@imports";
import {DECODER_REGISTRY} from '@decoding';
/* -------------------------------------------------- */
/* Lazy publisher proxy                               */
/* -------------------------------------------------- */
export interface InitDepsConfig {
  megaClient:    DatabaseClient;
  stagingClient: DatabaseClient;
  overrides?:    Partial<AllDeps>;
}
export function makeLazyPublisher(): QueuePublisher {
  return {
    publish:      (queue, payload)  => getPublisher().publish(queue, payload),
    publishBatch: (queue, payloads) => getPublisher().publishBatch(queue, payloads),
  };
}

/* -------------------------------------------------- */
/* Interfaces                                         */
/* -------------------------------------------------- */

export interface Repositories {
  pairsRepo:        PairsRepository;
  metaDataRepo:     MetaDataRepository;
  transactionsRepo: TransactionsRepository;
  logPayloadRepo:   LogPayloadRepository;
  logDataRepo:      LogDataRepository;
  signaturesRepo:   SignaturesRepository;
}

export interface Services {
  logPayloadService:   LogPayloadService;
  signaturesService:   SignaturesService;
  pairsService:        PairsService;
  metaDataService:     MetaDataService;
  transactionsService: TransactionsService;
  logDataService:      LogDataService;
}

export interface Orchestrators {
  logOrchestrator: LogOrchestrator;
}

export interface Limiters {
  rateLimiter: RateLimiterService;
}

export interface fetchManager {
  fetchManager:FetchManager
}

export interface Decoders {
  decoderRegistry: DecoderRegistry;
}
export interface Caches {
  cache: PipelineCache;
}

export interface AllDeps extends Repositories, Services, Orchestrators, Limiters, Decoders, fetchManager,Caches {
  publisher: QueuePublisher;
}

export interface PipelineDeps extends Repositories, Services, Orchestrators, Limiters {
  publisher: QueuePublisher;
}

/* -------------------------------------------------- */
/* Internal memoized state                            */
/* -------------------------------------------------- */

interface CreateRepositories {
  logPayloadRepo:   ReturnType<typeof createLogPayloadRepository>;
  logDataRepo:      ReturnType<typeof createLogDataRepository>;
  metaDataRepo:     ReturnType<typeof createMetaDataRepository>;
  pairsRepo:        ReturnType<typeof createPairsRepository>;
  transactionsRepo: ReturnType<typeof createTransactionsRepository>;
  signaturesRepo:   ReturnType<typeof createSignaturesRepository>;
}

interface CreateServices {
  logPayloadService:   ReturnType<typeof createLogPayloadService>;
  transactionsService: ReturnType<typeof createTransactionsService>;
  logDataService:      ReturnType<typeof createLogDataService>;
  metaDataService:     ReturnType<typeof createMetaDataService>;
  pairsService:        ReturnType<typeof createPairsService>;
  signaturesService:   ReturnType<typeof createSignaturesService>;
  logOrchestrator:     ReturnType<typeof createLogOrchestrator>;
}

interface CreateRateLimiter {
  rateLimiter: Awaited<ReturnType<typeof createRateLimiterService>>;
}

let _db:       DatabaseClient;
let _stagingDb: DatabaseClient;
let _app:      DatabaseApp;
let _repos:    CreateRepositories;
let _services: CreateServices;
let _limiter:  CreateRateLimiter;

/* -------------------------------------------------- */
/* Registry factory — stagingDb only flows to txns   */
/* -------------------------------------------------- */

/**
 * All repos point at mega (db).
 * TransactionsRepository is also mega — used for reads.
 * stagingDb is kept separate and injected only into TransactionsService.
 */
export function createRepositoryRegistry(
  db: DatabaseClient,
  stagingDb: DatabaseClient
): CreateRepositories {
  return {
    logPayloadRepo:   createLogPayloadRepository(db),
    logDataRepo:      createLogDataRepository(db),
    metaDataRepo:     createMetaDataRepository(db),
    pairsRepo:        createPairsRepository(db),
    transactionsRepo: createTransactionsRepository(db),   // reads → mega
    signaturesRepo:   createSignaturesRepository(db),
  };
}

export async function createRateLimiterRegistry(db: DatabaseClient): Promise<CreateRateLimiter> {
  const limiterDb = { db, ...getRateLimiterUrls() };
  return {
    rateLimiter: await createRateLimiterService(limiterDb),
  };
}

/* -------------------------------------------------- */
/* Services factory — stagingDb injected into txns   */
/* -------------------------------------------------- */

export function createServiceRegistry(
  app: DatabaseApp,
  db: DatabaseClient,
  stagingDb: DatabaseClient
): CreateServices {
  return {
    logPayloadService:   createLogPayloadService(app),
    logDataService:      createLogDataService(app),
    metaDataService:     createMetaDataService(app),
    pairsService:        createPairsService(app),
    signaturesService:   createSignaturesService(app),

    // Only TransactionsService gets the split config
    transactionsService: createTransactionsService({ db, stagingDb }),

    logOrchestrator: createLogOrchestrator({
      app,
      decoderRegistry: DECODER_REGISTRY,
      publisher: makeLazyPublisher(),
    }),
  };
}

/* -------------------------------------------------- */
/* Lazy container                                     */
/* -------------------------------------------------- */

export const getRepoServices = {

  db(): DatabaseClient {
    if (!_db) throw new Error('getRepoServices.db(): called before initDeps() seeded the client');
    return _db;
  },

  async stagingDb(): Promise<DatabaseClient> {
    if (!_stagingDb) throw new Error('getRepoServices.stagingDb(): called before initDeps() seeded the client');
    return _stagingDb;
  },

  async app(): Promise<DatabaseApp> {
    if (!_app) {
      _app = getDbApp(this.db(), await this.stagingDb());
    }
    return _app;
  },


  async repos(): Promise<CreateRepositories> {
    if (!_repos) {
      const stagingDb = await this.stagingDb();
      _repos = createRepositoryRegistry(this.db(), stagingDb);
    }
    return _repos;
  },

  async limiter(): Promise<CreateRateLimiter> {
    if (!_limiter) _limiter = await createRateLimiterRegistry(this.db());
    return _limiter;
  },

  async services(): Promise<CreateServices> {
    if (!_services) {
      const [app, stagingDb] = await Promise.all([this.app(), this.stagingDb()]);
      _services = createServiceRegistry(app, this.db(), stagingDb);
    }
    return _services;
  },

  async shutdown(): Promise<void> {
    if (_deps?.cache) _deps.cache.clear();
    if (_app?.shutdown) await _app.shutdown();
    _db = _repos = _services = _app = _limiter = _stagingDb = null!;
    _deps = null;
  },
};



/* -------------------------------------------------- */
/* Boot API                                           */
/* -------------------------------------------------- */

let _deps: AllDeps | null = null;



export interface InitDepsConfig {
  megaClient:    DatabaseClient;
  stagingClient: DatabaseClient;
  overrides?:    Partial<AllDeps>;
}


// In initDeps — FetchManager needs rateLimiter, so init it after limiter resolves
export async function initDeps(config: InitDepsConfig): Promise<AllDeps> {
  if (_deps) throw new Error("initDeps() already called — deps are a singleton");

  _db        = config.megaClient;
  _stagingDb = config.stagingClient;

  const [repos, services, limiter] = await Promise.all([
    getRepoServices.repos(),
    getRepoServices.services(),
    getRepoServices.limiter(),
  ]);

  const { initFetchManager } = await import('@rateLimiter');
  const fetchManager = await initFetchManager(limiter.rateLimiter);

  _deps = {
    pairsRepo:           repos.pairsRepo,
    metaDataRepo:        repos.metaDataRepo,
    transactionsRepo:    repos.transactionsRepo,
    logPayloadRepo:      repos.logPayloadRepo,
    logDataRepo:         repos.logDataRepo,
    signaturesRepo:      repos.signaturesRepo,
    rateLimiter:         limiter.rateLimiter,
    fetchManager,
    logPayloadService:   services.logPayloadService,
    signaturesService:   services.signaturesService,
    pairsService:        services.pairsService,
    metaDataService:     services.metaDataService,
    transactionsService: services.transactionsService,
    logDataService:      services.logDataService,
    logOrchestrator:     services.logOrchestrator,
    publisher:           makeLazyPublisher(),
    decoderRegistry:     DECODER_REGISTRY,
    cache:               new PipelineCache(),   // ← add this
    ...config.overrides,
  };

  return _deps;
}

type DepsInput = boolean | null | Partial<AllDeps>;

export function getDeps(input?: false): AllDeps;
export function getDeps(input?: true | null | Partial<AllDeps>): Promise<AllDeps>;
export function getDeps(input: DepsInput = true): AllDeps | Promise<AllDeps> {
  const isOverride = input !== null && typeof input === "object";
  const overrides  = isOverride ? (input as Partial<AllDeps>) : undefined;

  if (overrides) {
    const merged = { ...(_deps ?? {}), ...overrides } as AllDeps;
    return Promise.resolve(merged);
  }

  if (input !== false) {
    if (!_deps) throw new Error(
      'getDeps() called before initDeps() — call initDeps({ megaClient, stagingClient }) at process entry point'
    );
    return Promise.resolve(_deps);
  }

  if (!_deps) throw new Error("getDeps() called before initDeps() resolved");
  return _deps;
}
export function _resetDeps(): void {
  _deps = null;
}
