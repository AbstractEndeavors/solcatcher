/**
 * LOG PAYLOADS SERVICE
 *
 * CHANGES FROM PRIOR VERSION:
 *
 * 1. Registry injected into repo at construction — no module singleton.
 * 2. Update methods (markProcessed, markFailed, setDecodable, setUndecodable,
 *    setDecodedData) now return the repo's typed value instead of void,
 *    so callers get the updated row back if they want it.
 * 3. Removed .call(this.repo, ...) — bindRepo already wired these as methods.
 * 4. Removed .flat() from insertBatch callers — insertBatch returns
 *    BatchPayloadInsertSummary[], not nested arrays.
 * 5. isDecodable no longer creates a fresh registry per invocation.
 */

import {
  SOLANA_PUMP_FUN_PROGRAM_ID,
  isSignature,
  isId,
  initializeRegistry,
  parseProgramLogs,
  processParsedLogs,
} from '@imports';
import type {
  DatabaseClient,
  LimitLike,
  SigLike,
  IdLike,
  StringLike,
  BoolLike,
  AddressLike,
  IntLike,
  DataLike,
  BatchPayloadInsertSummary,
  LogPayloadRowLike,
  LogPayloadBatchItem,
  LogPayloadRow,
  InsertLogPayloadParams,
  InsertUnknownInstructionParams,
  FetchedTransaction,
  InvocationRecord,
  LogDataRow,
  DecodeBatchResult,
  ClassifiedEvent,
  PartitionedEvents,
} from '@imports';
import { LogPayloadRepository } from './repository/index.js';

// ============================================================
// TYPES
// ============================================================

export type ExtractInsertResult =
  | { kind: 'empty' }
  | { kind: 'inserted'; summaries: BatchPayloadInsertSummary[] };

export interface LogBatchParams {
  signature: SigLike;
  parsed_logs: InvocationRecord[];
}

export type PayloadRef = {
  id: number;
  signature: string;
  program_id: AddressLike;
};

export interface LogPayloadServiceConfig {
  db: DatabaseClient;
  /** Pass a shared registry from the outer composition root. */
  registry?: ReturnType<typeof initializeRegistry>;
}

// ============================================================
// HELPERS
// ============================================================

export function getLogLines(logs_b64: string): string[] {
  const decoded = Buffer.from(logs_b64, 'base64').toString('utf-8');
  try {
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : decoded.split('\n');
  } catch {
    return decoded.split('\n');
  }
}

// ============================================================
// SERVICE
// ============================================================

export class LogPayloadService {
  private readonly repo: LogPayloadRepository;

  constructor(config: LogPayloadServiceConfig) {
    // Registry flows down from composition root → service → repo → pipeline.
    // Nothing in this chain initializes the registry on its own.
    this.repo = new LogPayloadRepository(config.db, config.registry);
  }

  // ──────────────────────────────────────────────────────
  // LIFECYCLE
  // ──────────────────────────────────────────────────────

  async start(): Promise<void> {
    await this.repo.createTable();
  }

  // ──────────────────────────────────────────────────────
  // DECODE PIPELINE
  // ──────────────────────────────────────────────────────

  async decode(signature: SigLike): Promise<DecodeBatchResult> {
    return this.repo.decodeBySignature(signature);
  }

  async decodeOne(id: IdLike): Promise<ClassifiedEvent | null> {
    return this.repo.decodeById(id);
  }

  async decodePartitioned(
    signature: SigLike
  ): Promise<PartitionedEvents & { skipped: number }> {
    return this.repo.decodeAndPartition(signature);
  }

  decodeExisting(signature: SigLike, rows: LogPayloadRow[]): DecodeBatchResult {
    // decodeRows is now a free function that takes repo explicitly — no .call()
    return this.repo.decodeRows(this.repo, signature, rows);
  }

  // ──────────────────────────────────────────────────────
  // SUMMARY UTILITIES
  // ──────────────────────────────────────────────────────

  extractPayloadsFromSummary(batches: BatchPayloadInsertSummary[]): PayloadRef[] {
    return batches.flatMap(b =>
      b.ids.map(id => ({
        id,
        signature: b.signature,
        program_id: b.program_id,
      }))
    );
  }

  async extractPayloadsFromSummaryHydrate(
    batches: BatchPayloadInsertSummary[]
  ): Promise<LogPayloadRow[]> {
    const ids = batches.flatMap(b => b.ids);
    if (!ids.length) return [];
    return this.repo.fetchByIds(ids);
  }

  assertSummaryIntegrity(batches: BatchPayloadInsertSummary[]): void {
    for (const b of batches) {
      if (b.ids.length !== b.count) {
        throw new Error(
          `Summary mismatch for ${b.signature}:${b.program_id} — ` +
          `expected ${b.count} ids, got ${b.ids.length}`
        );
      }
    }
  }

  // ──────────────────────────────────────────────────────
  // INSERT
  // ──────────────────────────────────────────────────────

  async insertBatch(
    rows: (InsertLogPayloadParams | LogPayloadBatchItem)[]
  ): Promise<BatchPayloadInsertSummary[]> {
    return this.repo.insertBatch(rows);
  }

  async insertUnknownInstruction(
    params: InsertUnknownInstructionParams
  ): Promise<void> {
    return this.repo.insertUnknownInstruction(params);
  }

  async extractAndInsertFromRawLogData(
    logData?: LogDataRow
  ): Promise<BatchPayloadInsertSummary[]> {
    if (!logData) return [];
    const logLines = getLogLines(logData.logs_b64);
    const parsedLogs = parseProgramLogs(logLines);
    const payloadItems = processParsedLogs(logData.signature, parsedLogs);
    // insertBatch returns BatchPayloadInsertSummary[] — no .flat() needed
    return this.repo.insertBatch(payloadItems);
  }

  async extractAndInsertFromLogData(
    logData?: DataLike
  ): Promise<BatchPayloadInsertSummary[]> {
    if (!logData?.parsed_logs?.length) return [];
    const payloads = processParsedLogs(logData.signature, logData.parsed_logs);
    if (!payloads.length) return [];
    return this.repo.insertBatch(payloads);
  }

  async extractAndInsertFromLogDataExplicit(
    logData?: LogBatchParams
  ): Promise<ExtractInsertResult> {
    if (!logData?.parsed_logs?.length) return { kind: 'empty' };
    const payloads = processParsedLogs(logData.signature, logData.parsed_logs);
    if (!payloads.length) return { kind: 'empty' };
    const summaries = await this.repo.insertBatch(payloads);
    return { kind: 'inserted', summaries };
  }

  async extractAndInsertTxnData(
    txnData: FetchedTransaction,
    program_id: AddressLike = null
  ): Promise<BatchPayloadInsertSummary[]> {
    const { signature, tx } = txnData;
    const { meta } = tx;
    if (!tx || !meta) return [];
    program_id = program_id || SOLANA_PUMP_FUN_PROGRAM_ID;
    const parsed_logs = parseProgramLogs(meta.logMessages);
    return this.extractAndInsertFromLogData({ signature, parsed_logs });
  }

  // ──────────────────────────────────────────────────────
  // QUERY
  // ──────────────────────────────────────────────────────

  /**
   * Check decodability for a row or all rows under a signature.
   * Uses the repo's already-initialized registry — no fresh init per call.
   */
  async isDecodable(params: {
    id: IdLike;
    signature: SigLike;
  }): Promise<IntLike> {
    let rows: LogPayloadRow[] = [];

    if (isSignature(params.signature)) {
      rows = await this.repo.fetchBySignature(params.signature);
    } else if (isId(params.id)) {
      const row = await this.repo.fetchById(params.id);
      if (row) rows = [row];
    }

    // repo.registry is the injected registry — not a fresh one
    const { registry } = this.repo;

    for (const row of rows) {
      if (row.decodable == null) {
        const buffer = Buffer.from(row.b64, 'base64');
        const isKnown = registry.unified.has(buffer);
        if (isKnown) {
          await this.repo.setDecodable(row.id);
        } else {
          await this.repo.setUndecodable(row.id);
        }
      }
    }

    return this.repo.countUnprocessed();
  }

  async fetchById(id: IdLike): Promise<LogPayloadRowLike> {
    return this.repo.fetchById(id);
  }

  async fetchBySignature(signature: SigLike): Promise<LogPayloadRow[]> {
    return this.repo.fetchBySignature(signature);
  }

  async fetchByDiscriminator(params: {
    discriminator?: StringLike;
    limit?: LimitLike;
    latest?: BoolLike;
  }): Promise<LogPayloadRow[]> {
    return this.repo.fetchByDiscriminator(params);
  }

  async fetchByLimit(params: {
    limit?: LimitLike;
    latest?: BoolLike;
  }): Promise<LogPayloadRow[]> {
    return this.repo.fetchByLimit(params);
  }

  // ──────────────────────────────────────────────────────
  // PROCESSING WORKFLOW
  //
  // Return the updated row rather than void — callers that need
  // the row back get it; callers that don't can ignore it.
  // ──────────────────────────────────────────────────────

  async markProcessed(id: IdLike): Promise<LogPayloadRow | null> {
    return this.repo.markProcessed(id);
  }

  async markFailed(id: IdLike): Promise<LogPayloadRow | null> {
    return this.repo.markFailed(id);
  }

  async setDecodedData(
    id: IdLike,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> {
    return this.repo.setDecodedData(id, data);
  }

  async setDecodable(id: IdLike): Promise<LogPayloadRow | null> {
    return this.repo.setDecodable(id);
  }

  async setUndecodable(id: IdLike): Promise<LogPayloadRow | null> {
    return this.repo.setUndecodable(id);
  }

  async processPayload<T>(
    id: IdLike,
    handler: (row: LogPayloadRow) => Promise<T>
  ): Promise<T | null> {
    const row = await this.fetchById(id);
    if (!row) return null;
    try {
      const result = await handler(row as LogPayloadRow);
      await this.markProcessed(id);
      return result;
    } catch (error) {
      await this.markFailed(id);
      throw error;
    }
  }

  async processUnprocessedBatch(
    handler: (row: LogPayloadRow) => Promise<{ processed: IntLike; failed: number }>,
    input: { limit?: LimitLike; latest?: BoolLike }
  ): Promise<{ processed: number; failed: number }> {
    const rows = await this.repo.fetchByUnprocessed(input);
    let processed = 0;
    let failed = 0;

    for (const row of rows) {
      if (row.id == null) continue;
      try {
        await handler(row);
        await this.markProcessed(row.id);
        processed++;
      } catch {
        await this.markFailed(row.id);
        failed++;
      }
    }

    return { processed, failed };
  }

  // ──────────────────────────────────────────────────────
  // ANALYTICS
  // ──────────────────────────────────────────────────────

  async fetchDiscriminatorEvents(): Promise<Map<string, string[]>> {
    return this.repo.fetchDiscriminatorEvents();
  }

  async fetchDiscriminatorVersions(): Promise<Map<SigLike, IdLike>> {
    return this.repo.fetchDiscriminatorVersions();
  }

  async fetchDiscriminatorProgramFrequency(): Promise<
    Map<string, Map<AddressLike, IntLike>>
  > {
    return this.repo.fetchDiscriminatorProgramFrequency();
  }

  async countByProgram(): Promise<Map<AddressLike, IdLike>> {
    return this.repo.countByProgram();
  }

  async countUnprocessed(): Promise<IntLike> {
    return this.repo.countUnprocessed();
  }

  // ──────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────

  async hasSignature(signature: SigLike): Promise<boolean> {
    const rows = await this.fetchBySignature(signature);
    return rows.length > 0;
  }

  async getDiscriminatorsForProgram(program_id: string): Promise<string[]> {
    const freqMap = await this.fetchDiscriminatorProgramFrequency();
    const discriminators: string[] = [];
    for (const [disc, programMap] of freqMap) {
      if (programMap.has(program_id)) {
        discriminators.push(disc);
      }
    }
    return discriminators;
  }
}

// ============================================================
// FACTORY
// ============================================================

export function createLogPayloadService(
  config: LogPayloadServiceConfig
): LogPayloadService {
  return new LogPayloadService(config);
}