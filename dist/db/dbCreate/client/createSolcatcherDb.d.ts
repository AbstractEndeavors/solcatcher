import { type DatabaseApp } from "@imports";
import { ApplicationContainer } from "../container/ApplicationContainer.js";
export declare function createDbConfig(env?: any): import("@imports").DatabaseConfig;
export declare function createDbClient(env?: any): import("@imports").DatabaseClient;
export declare function createDbApp(env?: any): ApplicationContainer;
export declare function initializeDbApp(env?: any): Promise<ApplicationContainer>;
export declare function createSolcatcherDbApp(env?: any): Promise<ApplicationContainer>;
export declare function getDbApp(): Promise<DatabaseApp>;
