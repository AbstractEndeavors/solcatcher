import { 
  initDeps, 
  getRepoServices, 
  type AllDeps,
  initializeSchema, 
  initRateLimiter,
  createDatabaseConfig,
  createDatabaseClient 
} from '@db';
import { 
  loadRabbitEnv,
  loadStagingEnv, 
  loadPostgresEnv 
} from '@imports';
import {
  type QueueName,
  getEnabledQueueNames,
  getEnabledWorkerNames,
  isQueueEnabled,
  isWorkerEnabled,
  logQueueStatus,
  ConnectionManager,
  QueueConsumer,
  initPublisher,
  Registry ,
  createWorkersForQueues, 
  startAllWorkers, 
  stopAllWorkers,
  createHandlersForQueues, 
  type QueuePublisher, 
  type WorkerMap
} from '@pipeline';
class Pipeline {
  private connectionManager: ConnectionManager;
  private consumers: Map<QueueName, QueueConsumer<QueueName>> = new Map();
  private workers: WorkerMap = new Map();
  private publisher: QueuePublisher | null = null;
  private deps: AllDeps | null = null;
  private shutdownPromise: Promise<void> | null = null;
  // Own all pool refs for clean teardown
  private megaClient: ReturnType<typeof createDatabaseClient> | null = null;
  private stagingClient: ReturnType<typeof createDatabaseClient> | null = null;

  constructor(private readonly rabbitUrl: string) {
    this.connectionManager = new ConnectionManager({ url: rabbitUrl });
  }

  async start(): Promise<void> {
    console.log({ logType: 'info', message: '🚀 Starting pipeline...' });
    logQueueStatus();

    // ═══════════════════════════════════════════════════════════
    // PHASE 0: Pools — created ONCE here, passed everywhere
    // No other code should call createDatabaseClient or getPgPool
    // ═══════════════════════════════════════════════════════════
    console.log({ logType: 'info', message: 'Phase 0: Database pools...' });
    const megaEnv     = loadPostgresEnv();
    const stagingEnv  = await loadStagingEnv();
    this.megaClient    = createDatabaseClient(createDatabaseConfig(megaEnv));
    this.stagingClient = createDatabaseClient(createDatabaseConfig(stagingEnv));

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: Schema — use the pool we just created, no singleton
    // ═══════════════════════════════════════════════════════════
    console.log({ logType: 'info', message: 'Phase 1: Database schema...' });
    await initializeSchema(this.megaClient);

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: Rate Limiter — pass existing client, no new pool
    // ═══════════════════════════════════════════════════════════
    /*if (this.needsRpcAdapter()) {
      console.log({ logType: 'info', message: 'Phase 2: Rate limiter...' });
      await initRateLimiter(this.megaClient);
    } else {
      console.log({ logType: 'info', message: 'Phase 2: Rate limiter skipped (not needed)' });
    }*/

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: RabbitMQ
    // ═══════════════════════════════════════════════════════════
    console.log({ logType: 'info', message: 'Phase 3: RabbitMQ...' });
    await this.connectionManager.connect();

    // ═══════════════════════════════════════════════════════════
    // PHASE 4: Publisher
    // ═══════════════════════════════════════════════════════════
    console.log({ logType: 'info', message: 'Phase 4: Publisher...' });
    this.publisher = await initPublisher(this.connectionManager);

    // ═══════════════════════════════════════════════════════════
    // PHASE 5: Deps — pass clients in, no internal pool creation
    // ═══════════════════════════════════════════════════════════
    console.log({ logType: 'info', message: 'Phase 5: Deps...' });
    this.deps = await initDeps({
      megaClient:    this.megaClient,
      stagingClient: this.stagingClient,
    });

    // Phases 6-9 unchanged...
    console.log({ logType: 'info', message: 'Phase 6: Handlers...' });
    const enabledQueues = getEnabledQueueNames();
    createHandlersForQueues(this.deps, this.publisher, enabledQueues);
    Registry.markInitialized();
    const enabledWorkers = getEnabledWorkerNames();
    /*console.log({ logType: 'info', message: 'Phase 7: Workers...' });
    const enabledWorkers = getEnabledWorkerNames();
    if (enabledWorkers.length > 0) {
      this.workers = createWorkersForQueues(this.deps, this.publisher, enabledWorkers);
      await startAllWorkers(this.workers);
    }*/

    console.log({ logType: 'info', message: 'Phase 8: Consumers...' });
    for (const queueName of enabledQueues) {
      if (!Registry.hasHandler(queueName)) continue;
      const consumer = new QueueConsumer(this.connectionManager, queueName, this.publisher);
      await consumer.start();
      this.consumers.set(queueName, consumer);
    }

    this.setupShutdownHandlers();

    console.log({
      logType: 'success',
      message: '✅ Pipeline started',
      details: {
        enabledQueues,
        enabledWorkers,
        consumers: Array.from(this.consumers.keys()),
        workers:   Array.from(this.workers.keys()),
      },
    });
  }

  /*private needsRpcAdapter(): boolean {
    const rpcQueues: QueueName[] = ['offChainMetaDataEnrich', 'metaDataEnrich', 'onChainMetaDataEnrich', 'genesisLookup'];
    return rpcQueues.some(q => isQueueEnabled(q) || isWorkerEnabled(q));
  }*/

  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      if (this.shutdownPromise) return this.shutdownPromise;
      console.log({ logType: 'info', message: `Received ${signal}, shutting down...` });
      this.shutdownPromise = this.gracefulShutdown();
      await this.shutdownPromise;
      process.exit(0);
    };
    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  private async gracefulShutdown(): Promise<void> {
    console.log({ logType: 'info', message: 'Stopping consumers...' });
    await Promise.all(Array.from(this.consumers.values()).map(c => c.stop()));

    console.log({ logType: 'info', message: 'Stopping workers...' });
    await stopAllWorkers(this.workers);

    for (const [name, consumer] of this.consumers) {
      console.log({ logType: 'info', message: `${name} final metrics`, details: consumer.getMetrics() });
    }

    await this.connectionManager.shutdown();
    await getRepoServices.shutdown();

    // Close pools — Pipeline owns them, Pipeline closes them
    await this.megaClient?.end();
    await this.stagingClient?.end();

    console.log({ logType: 'success', message: '👋 Shutdown complete' });
  }
}
export async function bootstrap(): Promise<void> {
  try {
    const { url: rabbitUrl } = loadRabbitEnv();
    const pipeline = new Pipeline(rabbitUrl);
    await pipeline.start();
    await new Promise(() => {}); // keep-alive
  } catch (err) {
    console.error({
      logType: 'fatal',
      message: 'Pipeline failed to start',
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  }
}