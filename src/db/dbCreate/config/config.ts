/**
 * DATABASE CONFIGURATION REGISTRY
 * 
 * Centralized database configuration following these principles:
 * - Explicit environment wiring
 * - Type-safe schemas
 * - No global state
 * - Injectable dependencies
 */
import { 
  pathToFileURL,
  path,
  fs,
  DEFAULT_CONNECTION_LIMITS,
  DEFAULT_RETRY_CONFIG
} from "@imports";
import type { 
  RetryConfig,
  ConnectionLimits,
  DatabaseEnv,
  DatabaseConfig,
  TableRegistry,
  TableSchema 
} from "@imports";
import { fileURLToPath } from "url";

// ======================
// CONFIGURATION BUILDER
// ======================

export function createDatabaseConfig(
  env: DatabaseEnv,
  overrides?: {
    retryConfig?: Partial<RetryConfig>;
    connectionLimits?: Partial<ConnectionLimits>;
  }
): DatabaseConfig {
  return {
    pool: {
      host: env.host,
      port: env.port,
      database: env.database,
      user: env.user,
      password: env.password,
      ssl: env.ssl ? { rejectUnauthorized: false } : false,
      max: overrides?.connectionLimits?.maxConnections ?? DEFAULT_CONNECTION_LIMITS.maxConnections,
      idleTimeoutMillis:
        overrides?.connectionLimits?.idleTimeoutMs ?? DEFAULT_CONNECTION_LIMITS.idleTimeoutMs,
      connectionTimeoutMillis:
        overrides?.connectionLimits?.connectionTimeoutMs ??
        DEFAULT_CONNECTION_LIMITS.connectionTimeoutMs,
      statement_timeout:
        overrides?.connectionLimits?.statementTimeoutMs ??
        DEFAULT_CONNECTION_LIMITS.statementTimeoutMs,
    },
    retryConfig: {
      ...DEFAULT_RETRY_CONFIG,
      ...overrides?.retryConfig,
    },
    connectionLimits: {
      ...DEFAULT_CONNECTION_LIMITS,
      ...overrides?.connectionLimits,
    },
  };
}



export function sortTables(registry: TableRegistry): TableSchema[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: TableSchema[] = [];

  function visit(name: string) {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected at table: ${name}`);
    }

    const table = registry[name];
    if (!table) {
      throw new Error(`Missing table dependency: ${name}`);
    }

    visiting.add(name);

    for (const dep of table.dependsOn ?? []) {
      visit(dep);
    }

    visiting.delete(name);
    visited.add(name);
    result.push(table);
  }

  for (const name of Object.keys(registry)) {
    visit(name);
  }

  return result;
}


/* ======================
 * REGISTRY BUILDER
 * ====================== */



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOS_DIR = path.resolve(__dirname, "../../repositories/repos");


export async function createTableRegistry(): Promise<TableRegistry> {
  const registry: TableRegistry = {};

  const dirs = fs.readdirSync(REPOS_DIR, { withFileTypes: true })
    .filter((d:any) => d.isDirectory())
    .map((d:any) => d.name);

  for (const dir of dirs) {
    const queriesPath = path.join(REPOS_DIR, dir, "queries.ts");
    if (!fs.existsSync(queriesPath)) continue;

    const mod = await import(pathToFileURL(queriesPath).href);
    const exportKey = `${dir.toUpperCase()}_QUERIES`;
    const queries = mod[exportKey];

    if (!queries?.CREATE_TABLE) {
      throw new Error(`Invalid or missing ${exportKey} in ${queriesPath}`);
    }

    registry[dir] = {
      name: dir,
      creationQuery: queries.CREATE_TABLE,
      indexes: queries.CREATE_INDEXES ?? [],
      description: queries.DESCRIPTION ?? `Stores ${dir} data`,
      dependsOn: queries.DEPENDS_ON ?? [],
    }

  }

  return registry;
}


