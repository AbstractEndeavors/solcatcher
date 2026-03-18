import type { DatabaseClient } from "@imports";
import * as src from './src/index.js';
import { LogDataRow } from '@imports';
import type { DataLike } from '@imports';
export type LogDataRepositoryBindings = typeof src;
export interface LogDataRepository extends LogDataRepositoryBindings {
}
export declare class LogDataRepository {
    readonly db: DatabaseClient;
    constructor(db: DatabaseClient);
    rowToModel(row: DataLike): LogDataRow;
}
