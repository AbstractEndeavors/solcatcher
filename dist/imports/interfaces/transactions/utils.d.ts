import type { TransactionsInsertDTO } from './types.js';
import { TransactionsInsertParams } from './schemas.js';
import { type IdLike, type AddressLike, type IntLike, type SigLike } from './imports.js';
/**
 * Drop-in replacement for the old mapTradeEventToTransactionInsert.
 * Uses the new pipeline internally.
 *
 * @deprecated Use processTradeEvent() for new code.
 */
export declare function mapTradeEventToTransactionsInsert(params: {
    event: {
        name: string;
        category: string;
        data: Record<string, unknown>;
    };
    signature: SigLike;
    slot: IntLike;
    program_id: AddressLike;
    invocation: IntLike;
    log_id: IdLike;
    pair_id: IdLike;
    meta_id: IdLike;
}): TransactionsInsertParams;
/**
 * Strict validation right before DB insert.
 * Catches type mismatches that would cause silent DB errors.
 */
export declare function isDbSafeInsertTransactionsParams(p: unknown): p is TransactionsInsertParams;
export declare function toDbInsertParams(dto: TransactionsInsertDTO): TransactionsInsertParams;
