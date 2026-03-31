# solcatcher

A self-contained, real-time Solana transaction aggregation pipeline.

Ingests raw log streams, decodes Anchor events, classifies and enriches them, and persists structured data across a dual-database architecture.

Designed to operate without external API dependencies, while still supporting controlled integration of multiple RPC providers when useful.

---

## Why

Most Solana data pipelines depend on third-party APIs for decoding, enrichment, or historical access.

This system does not require that.

It was built to:
- remove dependency on external services
- retain full control over ingestion and decoding
- operate deterministically under load
- remain runnable by anyone with sufficient infrastructure

External APIs are treated as optional inputs, not structural requirements.

---

## What it does

1. **Ingests** raw Solana logs (websocket / RPC) → stores base64 + metadata  
2. **Parses** logs into structured invocation trees  
3. **Decodes** payloads using Anchor IDL registry  
4. **Classifies** events (trade, create, unknown)  
5. **Routes** events through a queue-driven pipeline  
6. **Enriches** with onchain + offchain metadata  
7. **Persists** to Postgres across domain tables  
8. **Serves** structured data via a typed API  

---

## Key Properties

- **API-agnostic architecture** — runs fully standalone, but can integrate and orchestrate multiple external providers when beneficial  
- **Queue-driven pipeline** — deterministic, observable flow with explicit stage separation  
- **Typed end-to-end** — schemas enforced from ingestion through persistence  
- **Dual-database model** — staging (writes) + mega (reads) for controlled state transitions  
- **Decoder registry** — multi-IDL, version-aware event decoding with discriminator fallback  
- **RPC orchestration layer** — in-memory URL selection, rate limiting, and circuit breaker handling  

---

## Architecture

Queue-driven pipeline with explicit stage separation:
```
Websocket / RPC
      │
      ▼
  logIntake queue          ← raw LogIntakePayload { signature, slot, program_id, logs_b64 }
      │
      ▼
  logEntry queue           ← insert + extract payloads + classify → ClassifiedEvent[]
      │
      ▼
  txnEntry queue           ← route to tradeEventEntry / createEventEntry
      │
  ┌───┴───┐
  ▼       ▼
trade   create             ← processTradeEventErrorGuard / processCreateEventErrorGuard
  │       │
  ▼       ▼
transactionInsert    metaDataGenesisInsert + pairGenesisInsert
  │                        │
  ▼                        ▼
enrichmentPipelineEntry → pairEnrich + metaDataEnrich
                               │               │
                         genesisLookup    onChainMetaDataEnrich
                         genesisEnrich    offChainMetaDataEnrich
```

Each stage is isolated, observable, and explicitly routed.

---

## API Strategy

The system is not bound to a single approach for data access.

- Can run entirely on raw log ingestion + internal decoding  
- Can integrate multiple RPC providers simultaneously  
- Uses internal selection + rate limiting to distribute load  
- Falls back automatically when endpoints degrade  

External services improve performance when available, but are never required.

---


## Running

```bash
npm install
npm run pipeline   # start ingestion + processing
npm run api        # start API server

Required:

PostgreSQL (mega + staging)
RabbitMQ
Solana RPC endpoint(s)
Notes
Repositories never throw — all DB operations return structured results
All pipeline stages operate on typed schemas
Decoder registry supports versioned IDLs and fallback resolution
Enrichment is idempotent and state-aware
```

---

## Failure Model

The pipeline is designed around explicit failure containment and recovery.

Failures are isolated at the queue level—each stage operates independently and does not propagate errors upstream.

Handling strategy:

- **Containment** — failures remain within a single queue stage  
- **Retry** — applied selectively per queue type (DB, RPC, routing)  
- **Degradation** — RPC layer dynamically routes around failing providers  
- **Fallback** — alternate endpoints used when all primary paths fail  
- **Persistence** — state is written incrementally to avoid loss  
- **Resumption** — idempotent enrichment allows safe reprocessing  

Repositories never throw—failures are returned as structured results and handled explicitly by the caller.

The system favors forward progress over strict completion: partial failure is acceptable, and missing data can be filled in through later enrichment passes.

Failures are expected, contained, and routed around—not treated as exceptional.

---
# Full Technical Breakdown

### Queue tier summary

| Tier | Queues | Prefetch | Retry |
|------|--------|----------|-------|
| CPU / routing | `logIntake`, `logEntry`, `txnEntry`, `enrichmentPipelineEntry` | 15–100 | dlq / drop |
| Light DB | `pairGenesisInsert`, `metaDataGenesisInsert`, `transactionInsert` | 10 | requeue ×3 |
| Heavy DB | `tradeEventEntry`, `createEventEntry`, `pairProvinenceEnrich` | 2–3 | requeue ×2 |
| Batch-fed | `pairEnrich`, `metaDataEnrich` | 8 | drop (worker re-feeds) |
| RPC-bound | `genesisEnrich`, `onChainMetaDataEnrich`, `offChainMetaDataEnrich`, `genesisLookup` | 1–5 | drop |

---

## Project layout

```
src/
├── imports/                  # Shared type/utility layer (@imports alias)
│   ├── src/
│   │   ├── interfaces/       # All domain types, schemas, validators
│   │   │   ├── events/       # TradeEvent, CreateEvent, classify/partition pipeline
│   │   │   ├── payloads/     # LogPayloadRow, IngestResult, classifier
│   │   │   ├── pairs/        # PairRow, PairEnrichmentRow, insert/upsert params
│   │   │   ├── metadata/     # MetaDataRow, enrichment types, buildMetadataUpsert
│   │   │   ├── transactions/ # TransactionsRow, TransactionsInsertParams
│   │   │   ├── signatures/   # SignaturesRow, SignatureDict, discovery types
│   │   │   ├── logdata/      # LogDataRow, RepoResult<T>, parseProgramLogs
│   │   │   ├── pools/        # EnhancedPool, CircuitBreakerPool, ConnectionSemaphore
│   │   │   ├── dbs/          # DatabaseClient, DatabaseConfig, QueryOptions
│   │   │   └── ...           # ids, mints, addresses, bools, bigints, urls, time, cursor
│   │   ├── envs/             # loadPostgresEnv, loadSolanaEnv, loadStagingEnv, etc.
│   │   ├── verifiers/        # Typed assertion validators (verifyMint, verifyId, etc.)
│   │   ├── constants.ts      # Program IDs, seeds, layout offsets
│   │   └── module_imports.ts # Re-exports from @putkoff/* packages
│   └── decoding/             # Anchor IDL registry
│       ├── src/
│       │   ├── buildDecoders.ts   # DecoderRegistry, TypeResolver, primitive readers
│       │   ├── registry.ts        # EventRegistry, InstructionRegistry
│       │   └── environment.ts     # DecoderEnvironment, IdlDecoderEnvironment
│       ├── versioned_registry.ts  # Program-keyed multi-IDL registry
│       └── main.ts               # DECODER_REGISTRY singleton, initializeRegistry()
│
├── db/
│   ├── dbCreate/
│   │   ├── client/           # PostgresDatabaseClient, createDatabaseClient, helper_functions
│   │   ├── config/           # createDatabaseConfig, createTableRegistry, sortTables
│   │   └── container/        # ApplicationContainer (initialize, shutdown, healthCheck)
│   └── repositories/
│       ├── createRepository.ts   # initDeps, getDeps, getRepoServices — the DI root
│       ├── cache.ts              # PipelineCache (PDAs, pairs, signatures, completion flags)
│       └── repos/
│           ├── logdata/          # LogDataRepository, LogDataService, BatchQueue/BatchBuffer
│           ├── payloads/         # LogPayloadRepository, LogPayloadService, decode pipeline
│           ├── pairs/            # PairsRepository, PairsService
│           ├── metadata/         # MetaDataRepository, MetaDataService
│           ├── transactions/     # TransactionsRepository, TransactionsService (mega/staging split)
│           ├── signatures/       # SignaturesRepository, SignaturesService
│           ├── ratelimiter/      # RateLimiterRepository, RateLimiterService, UrlSelectionRegistry
│           └── workflows/
│               └── LogOrchestrator.ts  # Top-level coordinator, bindRepo mixin pattern
│
├── pipeline/
│   ├── bootstrap.ts          # Pipeline class — phases 0–8, owns pool lifecycle
│   └── src/
│       ├── handlers/         # Handler factories (createLogIntakeHandler, etc.)
│       │   └── src/
│       │       ├── events/   # processTradeEvent, processCreateEvent, dispatchEvent
│       │       ├── genesis/  # genesisLookup, discoverSignatures, getOrDerivePDAs
│       │       ├── logs/     # repoResultToClassifiedEvents, logInsert
│       │       ├── metaData/ # onchainEnrich, offChainEnrich, metaDataEnrichment
│       │       ├── pairs/    # pairEnrichment, pairProvinenceEnrich
│       │       ├── txn/      # txnEntry, transactionInsert
│       │       ├── pipelines/# fetchOrCreateTxnRepoResult, callClassifiedEvents
│       │       └── utils/    # buildEnrichmentContext, getEventContext
│       ├── queues/           # QueueConfigs, config.ts, environment.ts
│       ├── transport/        # ConnectionManager, QueuePublisher, QueueConsumer
│       ├── workers/          # BatchWorker base, PairEnrichBatchWorker, MetaEnrichBatchWorker
│       ├── registry.ts       # PipelineRegistry singleton
│       └── imports/          # Payload validators, schemas, error types
│
└── servers/
    ├── fetcher/              # FetchManager, PDA derivation, genesis resolution
    │   ├── makeCalls/        # FetchManager class, RpcCache, initFetchManager
    │   └── pda/              # deriveAllPDAs, deriveAllPDAsAuto, resolveGenesisFull
    ├── limiter/              # Rate limiter HTTP server + client wrappers
    │   └── calls/            # fetchTransaction, fetchSignaturesForAddress, fetchMetaData, etc.
    └── ts/                   # Express API server
        └── routes/           # /pairs, /metadata, /transactions, /logdata, /charts, /pipeline
```

---

## Dependency injection pattern

Everything flows through `initDeps()` — called once at process startup, never again.

```typescript
// bootstrap.ts — Phase 5
this.deps = await initDeps({
  megaClient:    this.megaClient,    // reads, exists, aggregates
  stagingClient: this.stagingClient, // writes only (TransactionsService)
});

// anywhere downstream
const deps = getDeps(false);          // sync, throws if not initialized
const deps = await getDeps();         // async, same result
const deps = await getDeps(overrides); // test injection
```

`getRepoServices` provides lazy memoized access to the same objects without going through `initDeps` again — used in route handlers and workers that run after bootstrap.

---

## Decode pipeline

Raw `Program data:` base64 → typed event in four steps:

```
Buffer.from(b64, 'base64')
  → DECODER_REGISTRY.decode(buf)      // discriminator lookup, Anchor layout read
  → classifyPayload(row, registry)    // TradeEvent | CreateEvent | Unknown
  → partitionEvents(events)           // { trades[], creates[], unknowns[] }
```

Discriminators are 8-byte keys. The `unified` Map covers instructions, events, and accounts in a single lookup per program. `IngestResult` carries the decoded partition alongside `LogPayloadContext` — downstream consumers receive pre-partitioned events and never re-decode.

### IDL registry structure

The `decoding/src/idls/` tree has two parallel layers:

```
decoding/src/idls/
├── new/                          ← JSON IDLs used at runtime by the TypeScript decoder
│   ├── consolidated.json         ← merged pump AMM event discriminator map
│   ├── PumpFun/{Rust,Typescript}/
│   ├── Raydium/{Rust,Typescript}/
│   ├── Rabbitstream/Pumpfun/{Rust,Typescript}/
│   └── Shredstream/{Pumpfun,Raydium}/
│
├── PumpFun/Rust/                 ← full Rust parser crates (explains 87.5% Rust in repo)
├── Raydium/Rust/
├── Rabbitstream/Pumpfun/Rust/
├── Shredstream/Pumpfun/ (Rust)
│
└── solana-defi-main/             ← git submodule, not imported by the pipeline
```

The Rust crates under `idls/PumpFun/Rust/`, `idls/Raydium/Rust/`, etc. are standalone binaries (each has `Cargo.toml`, `src/main.rs`, Jito proto definitions). They are reference implementations, not called by the TypeScript pipeline at runtime. The pipeline uses only the JSON IDLs under `idls/new/`.

### Protocols covered

**pump.fun bonding curve** (`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`) — two versioned IDLs:

| | `pump_0.1.0.json` (legacy) | `idl.json` (current) |
|---|---|---|
| Events | 4 | 22 |
| `TradeEvent` fields | 8 (virtual reserves only) | 22 (adds real reserves, fee, creator fee, volume accumulator state, `ixName`, `mayhemMode`) |
| `CreateEvent` fields | 6 | 14 (adds creator, timestamp, initial reserves, token program, mayhem mode) |
| Discriminators | None (pre-discriminator format) | Explicit 8-byte arrays |
| Naming | camelCase | snake_case |

**pump.fun AMM** (`pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`) — `pump_amm_0.1.0.json`:
19 events including `BuyEvent`, `SellEvent`, `CreatePoolEvent`, `DepositEvent`, `WithdrawEvent`, `CreateConfigEvent`, liquidity and fee events.

**`itis.json`** — a bespoke IDL in `grpc-stream-and-parse-pump-amm-transaction` that defines `TradeEventExtended` (discriminator `[109,10,171,1,119,182,177,103]`) alongside the standard pump.fun bonding curve events. This is the only IDL defining `TradeEventExtended`.

**Raydium AMM** (`5quBtoiQqxF9Jv6KYKctB59NT3gtFD2XZjsRFYVJFE`) — `raydium_amm.json`:
5 log-based events (`Init`, `Deposit`, `Withdraw`, `SwapBaseIn`, `SwapBaseOut`) — no discriminators, decoded from `logType` field.

**Raydium CPMM** (`CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1D`) — `raydium_cp.json` / `cpmm_idl.json`:
2 events: `LpChangeEvent`, `SwapEvent`.

**Raydium CLMM** (`CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK`) — `raydium_clmm.json`:
11 events including `SwapEvent`, `PoolCreatedEvent`, `IncreaseLiquidityEvent`, `DecreaseLiquidityEvent`, position and fee events.

**Raydium Launchpad** — `raydium_launchpad.json`:
4 events: `PoolCreateEvent`, `TradeEvent`, `CreateVestingEvent`, `ClaimVestedEvent`.

### `VersionedDecoderRegistry` — resolution order

```
Buffer.from(b64, 'base64')
  → DECODER_REGISTRY.decode(buf, { programId })
      1. byProgramId.get(programId)  → try discriminator table
      2. anonymous[]                 → iterate IDLs without metadata.address
         (legacy pump_0.1.0.json files land here — no discriminators, matched by layout)
      3. return null → classified as UnknownEvent
```

IDLs with `metadata.address` register to `byProgramId`. IDLs without it (the pre-discriminator `pump_0.1.0.json` variants) accumulate in `anonymous[]` and are tried sequentially on fallback. `hashIdl()` deduplicates identical IDLs across the many subdirectories — the same discriminator table is never registered twice.

---

## Staging / mega split

Writes go to whichever `staging_*` database is currently active (determined by a registry row in `staging_a`). Reads always go to `mega`.

`loadStagingEnv()` queries the registry on every call — no caching, no stale state. The drain process handles DB swaps; the pipeline reconnects on next restart.

`TransactionsService` is the only service with a split constructor:

```typescript
constructor(config: { db: DatabaseClient; stagingDb: DatabaseClient }) {
  this.repo        = new TransactionsRepository(config.db);        // reads
  this.stagingRepo = new TransactionsRepository(config.stagingDb); // writes
}
```

All other services use `mega` only.

---

## Repository pattern

Repositories use `bindRepo` to mix in free functions as methods at construction time — no inheritance, no decorators:

```typescript
export class LogDataRepository {
  constructor(public readonly db: DatabaseClient) {
    bindRepo(this, { src }); // binds all exports from src/ as this.methodName
  }
}
```

Free functions in `src/fetch.ts`, `src/insert.ts`, etc. take `this: LogDataRepository` as their first parameter. The interface declaration merges the binding types.

All repository methods return `RepoResult<T>`:

```typescript
type RepoResult<T> =
  | { ok: true;  value: T }
  | { ok: false; reason: string; meta?: Record<string, unknown> };
```

Never throws at the repo boundary. `expectRepoValue(result)` unwraps or throws with context.

---

## Rate limiter

`RateLimiterService` wraps two layers:
- **`UrlSelectionRegistry`** — pure in-memory, synchronous, round-robin across healthy URLs with per-method cooldowns and circuit breaker
- **`RateLimiterRepository`** — Postgres-backed, async, for persistent rate event tracking, method limits, and state

Hot path (`fetchRpc`) calls `urlRegistry.getNextAvailable(method)` synchronously — no DB query. DB updates happen after the response.

`FetchManager` sits above the rate limiter and adds `RpcCache` (TTL-keyed by method/commitment) and inflight deduplication via `inflightRegistry`.

---

## Enrichment context

`EnrichmentContext` is the mutable state carrier through the enrichment pipeline:

```typescript
interface EnrichmentContext {
  pair_id: IdLike;
  meta_id: IdLike;
  mint: MintLike;
  program_id: AddressLike;
  pair: PairEnrichmentRow;    // mutable during enrichment
  meta: MetaDataEnrichmentRow;
  enrich_fields: { pair: string[]; meta: string[] }; // tracks what changed
  decoded?: PartitionedEvents;
  decode_summary?: { trade_count, create_count, ... };
}
```

`enrich_fields` accumulates field names as enrichers mutate `pair` and `meta`. `persistChanges` fires one `upsert` per entity if the list is non-empty, then clears it.

`buildEnrichmentContext` is idempotent — pass `forceFresh = true` to re-fetch after a write.

---

## PDA derivation

`deriveAllPDAsAuto` takes `{ mint, program_id }` and returns all four addresses without an RPC call:

- `metaplex` — `["metadata", METADATA_PROGRAM, mint]` → Metaplex metadata PDA
- `bonding_curve` — `["bonding-curve", mint]` → pump.fun bonding curve PDA
- `associated_bonding_curve` — `[bonding_curve, TOKEN_PROGRAM, mint]` → ATA for bonding curve
- `token_program` — auto-detected (Token vs Token-2022 based on mint suffix)

`PipelineCache` memoizes PDA results by mint for the lifetime of a batch run.

---

## Entry points

| Script | Entry | Purpose |
|--------|-------|---------|
| `npm run pipeline` | `clients/main-cli.ts` → `bootSolcatcher()` | Queue consumers + workers |
| `npm run api` | `clients/main-server.ts` → `initSolcatcherServer()` | Express API |
| `clients/main-limiter.ts` | `initLimiterServer()` | Rate limiter HTTP server |
| `clients/main-ws.ts` | `startSolcatcherWebsocket()` | Websocket ingestion |

All entry points install `uncaughtException` / `unhandledRejection` handlers before doing anything async.

`npm start` runs `api` and `pipeline` concurrently via `concurrently`.

---

## Environment variables

| Variable | Default | Used by |
|----------|---------|---------|
| `SOLCATCHER_POSTGRESQL_HOST` | `127.0.0.1` | mega DB |
| `SOLCATCHER_POSTGRESQL_PORT` | `5432` | mega DB |
| `SOLCATCHER_POSTGRESQL_USER` | `solcatcher` | mega DB |
| `SOLCATCHER_POSTGRESQL_PASS` | — | mega DB |
| `SOLCATCHER_POSTGRESQL_NAME` | `solcatcher` | mega DB |
| `STAGING_PG_HOST` | `127.0.0.1` | staging DB |
| `STAGING_PG_USER` | `postgres` | staging DB |
| `STAGING_PG_PASSWORD` | — | staging DB |
| `SOLCATCHER_AMQP_HOST` | `127.0.0.1` | RabbitMQ |
| `SOLCATCHER_AMQP_PORT` | `6044` | RabbitMQ |
| `SOLCATCHER_AMQP_USER` | — | RabbitMQ |
| `SOLCATCHER_AMQP_PASS` | — | RabbitMQ |
| `SOLCATCHER_AMQP_VHOST` | — | RabbitMQ |
| `SOLCATCHER_SOLANA_RPC_URL` | helius endpoint | primary RPC |
| `SOLCATCHER_SOLANA_FALLBACK_RPC_URL` | ankr endpoint | fallback RPC |
| `SOLCATCHER_TS_SERVER_PORT` | `6043` | API server |
| `SOLCATCHER_TS_LIMITER_PORT` | `6048` | limiter server |
| `SOLCATCHER_WS_BROADCAST_PORT` | `6047` | websocket |
| `PIPELINE_QUEUES` | `all` | selective queue enable (`all` / `none` / comma list) |
| `QUEUE_<NAME>_ENABLED` | — | per-queue override (`QUEUE_GENESIS_LOOKUP_ENABLED=false`) |

---

## Schema overview

All tables are created idempotently at startup via `initializeSchema` → `createTableRegistry` → `sortTables` (topological sort on `DEPENDS_ON`).

| Table | Key columns | Notes |
|-------|-------------|-------|
| `logdata` | `signature` (unique), `logs_b64`, `parsed_logs` (jsonb), `sorted` | Source of truth for raw logs |
| `log_payloads` | `(signature, invocation_index, discriminator)` (unique), `b64`, `decodable` | One row per `Program data:` entry |
| `pairs` | `mint` (unique), `(program_id, mint)` (unique), `status` stub→complete | Bonding curve identity + reserves |
| `metadata` | `mint` (unique), `status` stub→genesis→onchain→complete, jsonb blobs | Metaplex + offchain metadata |
| `transactions` | `signature` (unique), `is_buy`, AMM state, fees, volume tracking | Decoded trade/create events |
| `signatures` | `account` (PK), `signatures` jsonb array, `processed_until`, `discovery_complete` | Signature history per account |
| `rate_events` | `(netloc, method, time)` | Sliding window for rate limiting |
| `url_registry` | `identifier` (PK) | RPC endpoint registry |

---

## Key design decisions

**Queues over callbacks** — `BatchQueue<T>` emits `flush-ready` / `hardcap-reached` events; the consumer calls `take()` explicitly. No hidden flush callbacks.

**Registries over globals** — `DECODER_REGISTRY`, `QueryRegistry`, `QueueConfigs`, `PipelineRegistry`, `ProcessorRegistry` — all named, all statically typed, all reachable by key.

**Schemas over ad-hoc objects** — `TransactionsInsertParams`, `InsertLogDataParams`, `UpsertMethodLimitsParams`, etc. are classes with typed constructors. Nothing reaches the DB as a plain object.

**Explicit environment wiring** — `initDeps({ megaClient, stagingClient })` is called at one process entry point. Downstream code calls `getDeps(false)` or `await getDeps()`. No module-level pool creation outside the bootstrap.

**RepoResult<T> at the boundary** — repositories never throw. Callers decide how to handle `{ ok: false, reason, meta }`. `expectRepoValue` is the explicit unwrap.

**bindRepo mixin pattern** — keeps repository classes thin. Business logic lives in free functions that are testable independently of the class. The interface declaration merges the binding types so TypeScript sees a unified API.
