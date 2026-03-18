import { type DatabaseClient, LogPayloadRow } from "./imports.js";
import * as src from "./src/index.js";
export type LogPayloadRepositoryBindings = typeof src;
export interface LogPayloadRepository extends LogPayloadRepositoryBindings {
}
export declare class LogPayloadRepository {
    readonly db: DatabaseClient;
    constructor(db: DatabaseClient);
    rowToModel(row: any): LogPayloadRow;
}
export declare function createLogPayloadRepository(db: DatabaseClient): LogPayloadRepository;
