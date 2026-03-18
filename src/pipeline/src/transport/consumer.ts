// src/pipeline/transport/consumer-enhanced.ts
// ═══════════════════════════════════════════════════════════════════
// ENHANCED CONSUMER - SHOWS EXACTLY WHERE ERRORS HAPPEN
// ═══════════════════════════════════════════════════════════════════

import type { Channel, ConsumeMessage } from 'amqplib';
import type { ConnectionManager } from './connection.js';
import type { QueuePublisher } from './publisher.js';
import { 
  type QueueName, 
  type QueuePayloadMap, 
  type ConsumerMetrics,
  PipelineError, 
  formatErrorForLog, 
  createQueueErrorFactory,
  jsonSafeStringify,
  RETRY_HEADER,
  QueueConfigs,
  Registry
} from './imports.js';

export class QueueConsumer<T extends QueueName> {
  private channel: Channel | null = null;
  private paused = false;
  private consumerTag: string | null = null;
  private metrics: ConsumerMetrics = {
    processed: 0,
    failed: 0,
    retried: 0,
    dlq: 0,
    errors_by_phase: {},
    errors_by_type: {},
  };
  private errorFactory;

  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly queueName: T,
    private readonly publisher: QueuePublisher,
  ) {
    this.errorFactory = createQueueErrorFactory(queueName);
  }

  // ─────────────────────────────────────────────
  // START
  // ─────────────────────────────────────────────

  async start(): Promise<void> {
    const config = QueueConfigs[this.queueName];

    if (!Registry.hasHandler(this.queueName)) {
      throw this.errorFactory.generic(
        `No handler registered for queue: ${this.queueName}`,
        'start',
        { queue: this.queueName }
      );
    }

    this.channel = await this.connectionManager.getChannel(config.name, config.prefetch);

    // Assert main queue
    await this.channel.assertQueue(config.envKey, { durable: true });

    // Assert DLQ if strategy uses it
    if (config.retryStrategy === 'dlq') {
      await this.channel.assertQueue(`${config.envKey}.dlq`, { durable: true });
    }

    // Start consuming
    const { consumerTag } = await this.channel.consume(
      config.envKey,
      (msg) => this.handleMessage(msg),
      { noAck: false }
    );

    this.consumerTag = consumerTag;

    console.log({
      logType: 'success',
      message: 'Queue consumer started',
      details: {
        queue: config.name,
        envKey: config.envKey,
        prefetch: config.prefetch,
        retryStrategy: config.retryStrategy,
      },
    });
  }

  // ─────────────────────────────────────────────
  // MESSAGE HANDLING
  // ─────────────────────────────────────────────

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg || !this.channel) return;

    const config = QueueConfigs[this.queueName];
    const startTime = Date.now();
    let payload: unknown;
    let phase = 'parse';

    try {
      // ═══ PHASE 1: PARSE ═══
      phase = 'parse';
      try {
        payload = JSON.parse(msg.content.toString());
      } catch (err) {
      this.channel!.nack(msg, false, false);
      console.error({ logType: 'FATAL', queue: this.queueName, phase, payload: jsonSafeStringify(payload, 500), error: err });
      process.exit(1);
    }



      // ═══ PHASE 3: GET HANDLER ═══
      phase = 'get_handler';
      const handler = Registry.getHandler(this.queueName) as (payload: any) => Promise<any>;
      if (!handler) {
        throw this.errorFactory.generic(
          `Handler not found for ${this.queueName}`,
          'get_handler',
          { queue: this.queueName }
        );
      }

      // ═══ PHASE 4: EXECUTE HANDLER ═══
      phase = 'execute';
      let result: QueuePayloadMap[QueueName] | null;
      try {
        result = await handler(payload);
      } catch (err) {
        throw this.errorFactory.wrap(
          err as Error,
          'execute_handler',
          { payload}
        );
      }

      // ═══ PHASE 5: PUBLISH RESULT ═══
      if (result && config.nextQueue) {
        phase = 'publish';
        try {
          await this.publisher.publish(config.nextQueue, result);
        } catch (err) {
          throw this.errorFactory.wrap(
            err as Error,
            'publish_result',
            { nextQueue: config.nextQueue, result }
          );
        }
      }

      // ═══ SUCCESS ═══
      this.channel.ack(msg);
      this.metrics.processed++;

      // Log success (throttled)
      if (this.metrics.processed % 1000 === 0) {
        console.log({
          logType: 'debug',
          message: `${this.queueName} checkpoint`,
          details: { ...this.metrics, latency: Date.now() - startTime },
        });
      }

    } catch (err) {
      this.metrics.failed++;
      
      // Track error by phase and type
      this.metrics.errors_by_phase[phase] = (this.metrics.errors_by_phase[phase] || 0) + 1;
      
      if (err instanceof PipelineError) {
        const errorType = err.context.operation || 'unknown';
        this.metrics.errors_by_type[errorType] = (this.metrics.errors_by_type[errorType] || 0) + 1;
      }
      
      await this.handleError(msg, payload, err, phase);
    }
  }

  // ─────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────

  private async handleError(
    msg: ConsumeMessage,
    payload: unknown,
    err: unknown,
    phase: string
  ): Promise<void> {
    const config = QueueConfigs[this.queueName];
    const retryCount = this.getRetryCount(msg);
    const errorLog = formatErrorForLog(err);

    // ═══ LOG WITH FULL CONTEXT ═══
    console.log({
      logType: 'error',
      message: `${this.queueName} handler failed`,
      details: {
        phase,
        retry: retryCount,
        maxRetries: config.maxRetries,
        ...errorLog,
        payload: jsonSafeStringify(payload, 500),
      },
    });

    // ═══ RETRY STRATEGY ═══
    switch (config.retryStrategy) {
      case 'requeue':
        if (retryCount < config.maxRetries) {
          this.channel!.nack(msg, false, false);
          await this.republishWithRetry(msg, retryCount + 1);
          this.metrics.retried++;
        } else {
          this.channel!.ack(msg);
          console.log({
            logType: 'warn',
            message: `${this.queueName} max retries exceeded, dropping`,
            details: { payload: jsonSafeStringify(payload, 200) }
          });
        }
        break;

      case 'dlq':
        if (retryCount < config.maxRetries) {
          this.channel!.nack(msg, false, false);
          await this.republishWithRetry(msg, retryCount + 1);
          this.metrics.retried++;
        } else {
          await this.sendToDlq(msg, errorLog.message, errorLog.stack);
          this.channel!.ack(msg);
          this.metrics.dlq++;
        }
        break;

      case 'drop':
        this.channel!.ack(msg);
        break;
    }
  }

  private getRetryCount(msg: ConsumeMessage): number {
    const header = msg.properties.headers?.[RETRY_HEADER];
    return typeof header === 'number' ? header : 0;
  }

  private async republishWithRetry(msg: ConsumeMessage, retryCount: number): Promise<void> {
    const config = QueueConfigs[this.queueName];
    const headers = { ...msg.properties.headers, [RETRY_HEADER]: retryCount };

    this.channel!.sendToQueue(
      config.envKey,
      msg.content,
      { persistent: true, headers }
    );
  }

  private async sendToDlq(msg: ConsumeMessage, error: string, stack?: string): Promise<void> {
    const config = QueueConfigs[this.queueName];
    const dlqName = `${config.envKey}.dlq`;
    const headers = {
      ...msg.properties.headers,
      'x-death-reason': error,
      'x-death-stack': stack || 'no stack available',
      'x-death-time': new Date().toISOString(),
      'x-original-queue': config.envKey,
    };

    this.channel!.sendToQueue(dlqName, msg.content, { persistent: true, headers });

    console.log({
      logType: 'warn',
      message: `${this.queueName} sent to DLQ`,
      details: {
        dlqName,
        error,
        stack: stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
      },
    });
  }

  // ─────────────────────────────────────────────
  // CONTROL
  // ─────────────────────────────────────────────

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
      this.consumerTag = null;
    }

    console.log({
      logType: 'info',
      message: `${this.queueName} consumer stopped`,
      details: this.metrics,
    });
  }

  async pause(): Promise<void> {
    if (this.paused || !this.channel || !this.consumerTag) return;

    await this.channel.cancel(this.consumerTag);
    this.paused = true;

    console.log({
      logType: 'info',
      message: `${this.queueName} consumer paused`,
    });
  }

  async resume(): Promise<void> {
    if (!this.paused || !this.channel) return;

    const config = QueueConfigs[this.queueName];

    const { consumerTag } = await this.channel.consume(
      config.envKey,
      (msg) => this.handleMessage(msg),
      { noAck: false }
    );

    this.consumerTag = consumerTag;
    this.paused = false;

    console.log({
      logType: 'info',
      message: `${this.queueName} consumer resumed`,
    });
  }

  isPaused(): boolean {
    return this.paused;
  }

  getMetrics(): ConsumerMetrics {
    return { ...this.metrics };
  }
}
