/**
 * SIGNATURES REPOSITORY
 *
 * Repository for account signature tracking.
 * Manages signature history and processing cursors.
 *
 * Pattern: Explicit operations over generic abstractions
 */
import { type DatabaseClient, SignaturesRow, type AddressLike, type SigLike } from './imports.js';
export interface SignatureDict {
    signature: string;
    slot: number;
    err: string | null;
    memo: string | null;
    blockTime: number;
    confirmationStatus: string;
}
export declare class SignaturesRepository {
    readonly db: DatabaseClient;
    constructor(db: DatabaseClient);
    createTable(): Promise<void>;
    private rowToModel;
    fetchByAccount(account: AddressLike): Promise<SignaturesRow | null>;
    upsert(params: {
        account: AddressLike;
        signatures: SignatureDict[];
    }): Promise<void>;
    verifyInsert(account: AddressLike): Promise<SignatureDict[]>;
    markDiscoveryComplete(account: AddressLike): Promise<void>;
    markDiscoveryInComplete(account: AddressLike): Promise<void>;
    ensureAccount(account: AddressLike): Promise<void>;
    updateProcessedUntil(params: {
        account: AddressLike;
        signature: SigLike;
    }): Promise<void>;
}
export declare function createSignaturesRepository(db: DatabaseClient): SignaturesRepository;
