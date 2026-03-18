import { 
  initDeps, 
  type AllDeps,
  initializeSchema, 
  initRateLimiter,
  createDatabaseConfig,
  createDatabaseClient 
} from '@db';
import { 
  loadStagingEnv, 
  loadPostgresEnv 
} from '@imports';
import {
  logQueueStatus,
} from '@pipeline';
export class DepsInitializer {

  
  // Own all pool refs for clean teardown
  private megaClient: ReturnType<typeof createDatabaseClient> | null = null;
  private stagingClient: ReturnType<typeof createDatabaseClient> | null = null;


  async start(): Promise<AllDeps> {
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
    await initRateLimiter(this.megaClient);



    // ═══════════════════════════════════════════════════════════
    // PHASE 5: Deps — pass clients in, no internal pool creation
    // ═══════════════════════════════════════════════════════════
    console.log({ logType: 'info', message: 'Phase 5: Deps...' });
    return await initDeps({
      megaClient:    this.megaClient,
      stagingClient: this.stagingClient,
    });
  }

}
let deps: AllDeps | null = null;
let _init:DepsInitializer | null
export async function getDeps():Promise<AllDeps>{
  if (!deps){
    const _init = await new DepsInitializer();
    deps = await _init.start()

  }
  return deps

}