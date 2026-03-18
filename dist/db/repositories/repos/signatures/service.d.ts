import type { SigLike, AddressLike, MintLike, SignatureDict, DiscoverIncremental, SignaturesParams, SignaturesServiceConfig } from "@imports";
import { SignaturesRow } from '@imports';
export declare class SignaturesService {
    private readonly repo;
    constructor(config: SignaturesServiceConfig);
    start(): Promise<void>;
    upsert(params: {
        account: AddressLike;
        signatures: SignatureDict[];
    }): Promise<void>;
    /**
     * Update processing cursor
     */
    updateProcessedUntil(params: {
        account: AddressLike;
        signature: SigLike;
    }): Promise<void>;
    fetchByAccount(account: AddressLike): Promise<SignaturesRow | null>;
    /**
     * Verify signatures were inserted (debugging)
     */
    verifyInsert(account: AddressLike): Promise<any[]>;
    /**
     * Get the current processing cursor for an account
     */
    getProcessedUntil(account: AddressLike): Promise<string | null>;
    /**
     * Move cursor to latest signature
     */
    markLatestProcessed(account: AddressLike): Promise<void>;
    /**
     * Check if account has unprocessed signatures
     */
    hasUnprocessedSignatures(account: AddressLike): Promise<boolean>;
    /**
     * Get unprocessed signatures (after cursor)
     */
    getUnprocessedSignatures(account: AddressLike): Promise<any[]>;
    /**
     * Fetch or initialize account
     */
    fetchOrCreate(params: {
        account: AddressLike;
        signatures: any[];
    }): Promise<SignaturesRow>;
    /**
     * Fetch or fetch from RPC
     */
    fetchOrFetchFromRpc(account: AddressLike, fetcher: (account: AddressLike) => Promise<any[]>): Promise<SignaturesRow>;
    /**
     * Update signatures and advance cursor
     */
    updateAndAdvanceCursor(params: {
        account: AddressLike;
        signatures: any[];
    }): Promise<void>;
    /**
     * Process unprocessed signatures with callback
     */
    processUnprocessed(account: string, processor: (signatures: any[]) => Promise<void>): Promise<number>;
    getExistingSignatures(account: AddressLike): Promise<SignatureDict[]>;
    combineSignatures(params: {
        account: AddressLike;
        signatures: SignatureDict[];
    }): Promise<SignatureDict[]>;
    insertSignatures(params: {
        account: AddressLike;
        signatures: SignatureDict[];
    }): Promise<void>;
    getGenesisSignatureFromMint(mint: MintLike): Promise<SigLike>;
    getFirstTx(params: SignaturesParams): Promise<string | null>;
    getSignaturesInsertSignatures(params: SignaturesParams): Promise<SignatureDict[]>;
    discoverSignaturesIncremental(params: SignaturesParams): Promise<DiscoverIncremental>;
    findGenesisSignature(options: SignaturesParams): Promise<SigLike>;
}
export declare function createSignaturesService(config: SignaturesServiceConfig): SignaturesService;
