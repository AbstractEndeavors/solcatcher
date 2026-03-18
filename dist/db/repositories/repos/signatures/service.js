/**
 * SIGNATURES SERVICE
 *
 * Service layer for signature tracking and cursor management.
 * Explicit wiring, no hidden state.
 *
 * Pattern: Explicit dependencies over smart defaults
 */
import { SignaturesRepository } from './repository/index.js';
import { fetchSignaturesForAddress } from '@rateLimiter';
import { getMetadataPda } from '@rateLimiter';
import { getPubkeyString, SignaturesRow, UpdateProcessedUntilParams, oldestSignature, getAnySignature, normalizeSigs, getSignature, PublicKey } from '@imports';
// ============================================================
// SERVICE CONFIGURATION (Explicit environment)
// ============================================================
// ============================================================
// SERVICE
// ============================================================
export class SignaturesService {
    repo;
    constructor(config) {
        // Explicit wiring
        this.repo = new SignaturesRepository(config.db);
    }
    // ──────────────────────────────────────────────────────
    // LIFECYCLE
    // ──────────────────────────────────────────────────────
    async start() {
        await this.repo.createTable();
    }
    // ──────────────────────────────────────────────────────
    // UPSERT
    // ──────────────────────────────────────────────────────
    async upsert(params) {
        return this.repo.upsert(params); // ✅ Use repo's domain method
    }
    /**
     * Update processing cursor
     */
    async updateProcessedUntil(params) {
        return this.repo.updateProcessedUntil(params);
    }
    // ──────────────────────────────────────────────────────
    // QUERY
    // ──────────────────────────────────────────────────────
    async fetchByAccount(account) {
        return this.repo.fetchByAccount(account);
    }
    /**
     * Verify signatures were inserted (debugging)
     */
    async verifyInsert(account) {
        return this.repo.verifyInsert(account);
    }
    // ──────────────────────────────────────────────────────
    // CURSOR MANAGEMENT HELPERS
    // ──────────────────────────────────────────────────────
    /**
     * Get the current processing cursor for an account
     */
    async getProcessedUntil(account) {
        const row = await this.fetchByAccount(account);
        return row?.processed_until ?? null;
    }
    /**
     * Move cursor to latest signature
     */
    async markLatestProcessed(account) {
        const row = await this.fetchByAccount(account);
        if (!row) {
            throw new Error(`Account not found: ${account}`);
        }
        const latestSig = row.latestSignature;
        if (!latestSig) {
            throw new Error(`No signatures for account: ${account}`);
        }
        await this.updateProcessedUntil({ account, signature: latestSig });
    }
    /**
     * Check if account has unprocessed signatures
     */
    async hasUnprocessedSignatures(account) {
        const row = await this.fetchByAccount(account);
        if (!row)
            return false;
        // No signatures at all
        if (!row.hasSignatures)
            return false;
        // No cursor set - all signatures are unprocessed
        if (!row.hasProcessedSignatures)
            return true;
        // Compare latest signature with cursor
        return row.latestSignature !== row.processed_until;
    }
    /**
     * Get unprocessed signatures (after cursor)
     */
    async getUnprocessedSignatures(account) {
        const row = await this.fetchByAccount(account);
        if (!row)
            return [];
        // No signatures
        if (!row.hasSignatures)
            return [];
        // No cursor - all signatures are unprocessed
        if (!row.hasProcessedSignatures) {
            return row.signatures;
        }
        // Find cursor position and return signatures after it
        const cursorIndex = row.signatures.findIndex((sig) => sig.signature === row.processed_until);
        if (cursorIndex === -1) {
            // Cursor not found - return all signatures
            return row.signatures;
        }
        // Return signatures before cursor (more recent)
        return row.signatures.slice(0, cursorIndex);
    }
    /**
     * Fetch or initialize account
     */
    async fetchOrCreate(params) {
        // Try fetch first
        const existing = await this.fetchByAccount(params.account);
        if (existing) {
            return existing;
        }
        // Create with initial signatures
        await this.upsert(params);
        // Return created row
        const row = await this.fetchByAccount(params.account);
        if (!row) {
            throw new Error('Failed to fetch created signatures row');
        }
        return row;
    }
    /**
     * Fetch or fetch from RPC
     */
    async fetchOrFetchFromRpc(account, fetcher) {
        // Try fetch first
        const existing = await this.fetchByAccount(account);
        if (existing) {
            return existing;
        }
        // Fetch from RPC
        const signatures = await fetcher(account);
        // Insert
        await this.upsert({ account, signatures });
        // Return inserted row
        const row = await this.fetchByAccount(account);
        if (!row) {
            throw new Error('Failed to fetch inserted signatures row');
        }
        return row;
    }
    /**
     * Update signatures and advance cursor
     */
    async updateAndAdvanceCursor(params) {
        // Update signatures
        await this.upsert(params);
        // Advance cursor to latest
        if (params.signatures.length > 0) {
            const latestSig = params.signatures[0]?.signature;
            if (latestSig) {
                await this.updateProcessedUntil({ account: params.account, signature: latestSig });
            }
        }
    }
    /**
     * Process unprocessed signatures with callback
     */
    async processUnprocessed(account, processor) {
        const unprocessed = await this.getUnprocessedSignatures(account);
        if (unprocessed.length === 0) {
            return 0;
        }
        // Process signatures
        await processor(unprocessed);
        // Advance cursor to latest processed
        const latestSig = unprocessed[0]?.signature;
        if (latestSig) {
            await this.updateProcessedUntil(new UpdateProcessedUntilParams(account, latestSig));
        }
        return unprocessed.length;
    }
    async getExistingSignatures(account) {
        try {
            const row = await this.fetchByAccount(account);
            return normalizeSigs(row);
        }
        catch (err) {
            console.log({
                function_name: 'getExistingSignatures',
                message: `Error fetching signatures for ${account}`,
                details: err.message,
                logType: 'error',
            });
            return [];
        }
    }
    async combineSignatures(params) {
        let { account, signatures } = params;
        const existing = Array.isArray(await this.getExistingSignatures(account))
            ? await this.getExistingSignatures(account)
            : [];
        signatures = Array.isArray(signatures)
            ? signatures
            : [];
        // Merge
        const combined = [...existing, ...signatures];
        // Deduplicate by signature
        const map = new Map();
        for (const sig of combined) {
            const key = getAnySignature(sig);
            if (!map.has(key)) {
                map.set(key, sig);
            }
        }
        // Normalize + sort newest → oldest
        const final = Array.from(map.values()).sort((a, b) => (b.blockTime ?? b.block_time ?? 0) - (a.blockTime ?? a.block_time ?? 0));
        return final;
    }
    async insertSignatures(params) {
        let { account, signatures } = params;
        params.signatures = normalizeSigs(signatures);
        params.signatures = await this.combineSignatures(params);
        await this.upsert(params);
        await this.verifyInsert(account);
    }
    async getGenesisSignatureFromMint(mint) {
        mint = new PublicKey(mint);
        const metadataPda = getMetadataPda(mint);
        // 1️⃣ Preferred: metadata PDA creation
        const sig = await this.getFirstTx({ account: getPubkeyString(metadataPda) });
        if (sig)
            return sig;
        // 2️⃣ Fallback: mint address itself
        const mintSig = await this.getFirstTx({ account: mint });
        if (mintSig)
            return mintSig;
        throw new Error("Unable to determine token creation");
    }
    async getFirstTx(params) {
        const sigs = await this.getSignaturesInsertSignatures(params);
        if (!sigs.length)
            return null;
        return oldestSignature(sigs, true);
    }
    async getSignaturesInsertSignatures(params) {
        let signatures = [];
        let { account, until } = params;
        // ✅ Fail fast with explicit validation
        if (!account) {
            throw new Error('getSignaturesInsertSignatures: account is required');
        }
        try {
            signatures = await fetchSignaturesForAddress(params);
            if (!signatures.length) {
                return signatures;
            }
            await this.upsert({ account, signatures });
            if (params.until) {
                await this.updateProcessedUntil({ account, signature: until });
            }
            return signatures;
        }
        catch (err) {
            console.log({
                logType: "error",
                message: "getSignaturesInsertSignatures failed",
                details: err,
            });
            return signatures;
        }
    }
    async discoverSignaturesIncremental(params) {
        let { account, until, limit, commitment, maxAttempts = 10, isIncomplete = false } = params;
        // service.ts - discoverSignaturesIncremental
        const accountStr = getPubkeyString(account);
        await this.repo.ensureAccount(accountStr); // ← row always exists after this
        if (!account)
            throw new Error('discoverSignaturesIncremental: account is required');
        if (isIncomplete) {
            await this.repo.markDiscoveryInComplete(accountStr);
        }
        // Normalize ONCE, use exclusively from here down
        const row = await this.fetchByAccount(accountStr);
        limit = limit || 1000;
        until = until || row?.processed_until || null;
        if (row?.discovery_complete) {
            return { until, fetched: 0, complete: true };
        }
        let sigs = await fetchSignaturesForAddress({ account: accountStr, until, limit });
        if (sigs.length === 0) {
            if (until !== null)
                await this.repo.markDiscoveryComplete(accountStr);
            return { until, fetched: 0, complete: true };
        }
        const until_next = sigs[sigs.length - 1]?.signature;
        const merged = await this.combineSignatures({ account: accountStr, signatures: sigs });
        await this.upsert({ account: accountStr, signatures: merged });
        await this.updateProcessedUntil({ account: accountStr, signature: until_next });
        const complete = sigs.length < limit;
        if (complete)
            await this.repo.markDiscoveryComplete(accountStr);
        return { until: until_next, fetched: sigs.length, complete };
    }
    async findGenesisSignature(options) {
        let { account, until, commitment, maxAttempts } = options;
        if (!account)
            return null;
        const limit = 1000;
        const result = await this.discoverSignaturesIncremental({
            account,
            until,
            limit,
            commitment
        });
        let complete = result.complete;
        until = result.until;
        let attempts = 1;
        maxAttempts = maxAttempts || 10;
        while (!complete && attempts++ < maxAttempts) {
            const result = await this.discoverSignaturesIncremental({
                account,
                limit
            });
            complete = result.complete;
            until = result.until;
        }
        return until;
    }
}
// ============================================================
// FACTORY (Explicit wiring)
// ============================================================
export function createSignaturesService(config) {
    return new SignaturesService(config);
}
