
import { initializeSchema } from "./../config/index.js";
import type {DatabaseApp,DatabaseClient} from '@imports';


export class ApplicationContainer implements DatabaseApp {
  private initialized = false;
  private readonly startedAt = Date.now();

  constructor(
    public readonly db: DatabaseClient,
    public readonly repos: any
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await initializeSchema();

    this.initialized = true;
  }


  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
  }

  async healthCheck() {
    try {
      await this.db.query("SELECT 1");
      return {
        healthy: true,
        uptime: Date.now() - this.startedAt,
      };
    } catch {
      return {
        healthy: false,
        uptime: Date.now() - this.startedAt,
      };
    }
  }
}
