import { TransactionsRepository } from './../TransactionsRepository.js';
import type { IdLike, TransactionsInsertParams } from '@imports';
export declare function insertAndReturnId(this: TransactionsRepository, params: TransactionsInsertParams): Promise<IdLike | null>;
export declare function insert(this: TransactionsRepository, params: TransactionsInsertParams): Promise<IdLike>;
/**
 * Insert if not exists, return existing id if conflict.
 * Avoids the round-trip check pattern.
 */
export declare function insertOrIgnore(this: TransactionsRepository, params: TransactionsInsertParams): Promise<IdLike | null>;
