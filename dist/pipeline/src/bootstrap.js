// src/pipeline/bootstrap.ts
// ═══════════════════════════════════════════════════════════════════
// BOOTSTRAP - WITH SELECTIVE QUEUE/WORKER ENABLING
// ═══════════════════════════════════════════════════════════════════
//
// BOOT ORDER CONTRACT:
//   1. DB schema       — tables exist
//   2. Rate limiter    — RPC calls won't explode
//   3. RabbitMQ conn   — transport layer up
//   4. Publisher        — singleton exists before anything can call getPublisher()
//   5. Repos & services — safe now: getRepoServices.services() internally
//                         calls getPublisher(), which requires step 4
//   6. Deps container  — explicit wiring, no hidden state
//   7. Handlers        — bound to deps
//   8. Workers         — optional background loops
//   9. Consumers       — start pulling from queues
//  10. Shutdown hooks  — clean teardown
//
// WHY THIS ORDER MATTERS:
//   getRepoServices.services() reaches into the publisher singleton
//   (via getPublisher() in db.ts:185). If the publisher isn't initialized
//   yet, you get:
//     "Publisher not initialized - call initPublisher first"
//   The old order ran services (Phase 3) before publisher (Phase 5).
// ═══════════════════════════════════════════════════════════════════
import 'dotenv/config';
import { loadRabbitEnv, initializeRegistry } from '@imports';
import { initializeSchema, initRateLimiter } from '@db';
import { getRepoServices } from '@repoServices';
import { Registry, getEnabledQueueNames, getEnabledWorkerNames, isQueueEnabled, isWorkerEnabled, logQueueStatus } from './registry/index.js';
import { initDeps, getDeps } from '@repoServices';
import { ConnectionManager } from './transport/connection.js';
import { QueueConsumer } from './transport/consumer/index.js';
import { initPublisher } from './transport/publisher.js';
import { createHandlersForQueues } from './handlers/index.js';
import { createWorkersForQueues, startAllWorkers, stopAllWorkers } from './workers/index.js';
class Pipeline {
    rabbitUrl;
    connectionManager;
    consumers = new Map();
    workers = new Map();
    publisher = null;
    deps = null;
    shutdownPromise = null;
    constructor(rabbitUrl) {
        this.rabbitUrl = rabbitUrl;
        this.connectionManager = new ConnectionManager({ url: rabbitUrl });
    }
    async start() {
        console.log({ logType: 'info', message: '🚀 Starting pipeline...' });
        await initDeps();
        // Log what's enabled
        logQueueStatus();
        // ═══════════════════════════════════════════════════════════
        // PHASE 1: Database Schema
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 1: Database schema...' });
        await initializeSchema();
        // ═══════════════════════════════════════════════════════════
        // PHASE 2: Rate Limiter (only if needed)
        // ═══════════════════════════════════════════════════════════
        const needsRpc = this.needsRpcAdapter();
        if (needsRpc) {
            console.log({ logType: 'info', message: 'Phase 2: Rate limiter...' });
            await initRateLimiter();
        }
        else {
            console.log({ logType: 'info', message: 'Phase 2: Rate limiter skipped (not needed)' });
        }
        // ═══════════════════════════════════════════════════════════
        // PHASE 3: RabbitMQ Connection
        //   MOVED BEFORE repos/services — publisher must exist first
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 3: RabbitMQ...' });
        await this.connectionManager.connect();
        // ═══════════════════════════════════════════════════════════
        // PHASE 4: Publisher
        //   MOVED BEFORE repos/services — getRepoServices.services()
        //   calls getPublisher() internally (db.ts:185)
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 4: Publisher...' });
        this.publisher = await initPublisher(this.connectionManager);
        // ═══════════════════════════════════════════════════════════
        // PHASE 5: Repos & Services
        //   NOW SAFE: publisher singleton exists
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 5: Repos & services...' });
        // ═══════════════════════════════════════════════════════════
        // PHASE 6: Dependencies Container
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 6: Dependencies...' });
        this.deps = await getDeps();
        // ═══════════════════════════════════════════════════════════
        // PHASE 7: Handlers (only for enabled queues)
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 7: Handlers...' });
        const enabledQueues = getEnabledQueueNames();
        createHandlersForQueues(this.deps, this.publisher, enabledQueues);
        Registry.markInitialized();
        // ═══════════════════════════════════════════════════════════
        // PHASE 8: Workers (only for enabled workers)
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 8: Workers...' });
        const enabledWorkers = getEnabledWorkerNames();
        if (enabledWorkers.length > 0) {
            this.workers = createWorkersForQueues(this.deps, this.publisher, enabledWorkers);
            await startAllWorkers(this.workers);
        }
        else {
            console.log({ logType: 'info', message: 'No workers enabled' });
        }
        // ═══════════════════════════════════════════════════════════
        // PHASE 9: Consumers (only for enabled queues)
        // ═══════════════════════════════════════════════════════════
        console.log({ logType: 'info', message: 'Phase 9: Consumers...' });
        for (const queueName of enabledQueues) {
            if (!Registry.hasHandler(queueName)) {
                console.warn({ logType: 'warn', message: `Skipping queue without handler: ${queueName}` });
                continue;
            }
            const consumer = new QueueConsumer(this.connectionManager, queueName, this.deps, this.publisher);
            await consumer.start();
            this.consumers.set(queueName, consumer);
        }
        // ═══════════════════════════════════════════════════════════
        // PHASE 10: Shutdown Handlers
        // ═══════════════════════════════════════════════════════════
        this.setupShutdownHandlers();
        console.log({
            logType: 'success',
            message: '✅ Pipeline started',
            details: {
                enabledQueues,
                enabledWorkers,
                consumers: Array.from(this.consumers.keys()),
                workers: Array.from(this.workers.keys()),
            }
        });
    }
    /**
     * Check if any enabled queue needs RPC access
     */
    needsRpcAdapter() {
        const rpcQueues = ['offChainMetaDataEnrich', 'metaDataEnrich', 'onChainMetaDataEnrich', 'genesisLookup'];
        return rpcQueues.some(q => isQueueEnabled(q) || isWorkerEnabled(q));
    }
    setupShutdownHandlers() {
        const shutdown = async (signal) => {
            if (this.shutdownPromise)
                return this.shutdownPromise;
            console.log({ logType: 'info', message: `Received ${signal}, shutting down...` });
            this.shutdownPromise = this.gracefulShutdown();
            await this.shutdownPromise;
            process.exit(0);
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    async gracefulShutdown() {
        console.log({ logType: 'info', message: 'Stopping consumers...' });
        await Promise.all(Array.from(this.consumers.values()).map(c => c.stop()));
        console.log({ logType: 'info', message: 'Stopping workers...' });
        await stopAllWorkers(this.workers);
        for (const [name, consumer] of this.consumers) {
            console.log({
                logType: 'info',
                message: `${name} final metrics`,
                details: consumer.getMetrics(),
            });
        }
        await this.connectionManager.shutdown();
        await getRepoServices.shutdown();
        console.log({ logType: 'success', message: '👋 Shutdown complete' });
    }
    getMetrics() {
        const metrics = {};
        for (const [name, consumer] of this.consumers) {
            metrics[name] = consumer.getMetrics();
        }
        for (const [name, worker] of this.workers) {
            metrics[`${name}_worker`] = worker.getMetrics();
        }
        return metrics;
    }
}
export async function bootstrap() {
    try {
        const rabbitUrl = loadRabbitEnv().url;
        const pipeline = new Pipeline(rabbitUrl);
        console.log(loadRabbitEnv());
        await pipeline.start();
        await new Promise(() => { }); // Keep alive
    }
    catch (err) {
        console.error({
            logType: 'fatal',
            message: 'Pipeline failed to start',
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
        });
        process.exit(1);
    }
}
