import { initializeSchema } from "./../config/index.js";
export class ApplicationContainer {
    db;
    repos;
    initialized = false;
    startedAt = Date.now();
    constructor(db, repos) {
        this.db = db;
        this.repos = repos;
    }
    async initialize() {
        if (this.initialized)
            return;
        await initializeSchema();
        this.initialized = true;
    }
    async shutdown() {
        if (!this.initialized)
            return;
        this.initialized = false;
    }
    async healthCheck() {
        try {
            await this.db.query("SELECT 1");
            return {
                healthy: true,
                uptime: Date.now() - this.startedAt,
            };
        }
        catch {
            return {
                healthy: false,
                uptime: Date.now() - this.startedAt,
            };
        }
    }
}
