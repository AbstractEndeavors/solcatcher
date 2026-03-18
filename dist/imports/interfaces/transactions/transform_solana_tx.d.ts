import type { SigLike, IntLike, AddressLike, GetTxnResponseTranscription } from '@imports';
/**
 * Solana getTransaction response structure
 */
export interface SolanaTransactionResponse {
    blockTime: number | null;
    slot: number;
    version: number | 'legacy';
    transaction: [
        string,
        'base64'
    ];
    meta: SolanaTransactionMeta | null;
}
export interface SolanaTransactionMeta {
    err: unknown | null;
    fee: number;
    computeUnitsConsumed?: number;
    costUnits?: number;
    preBalances: number[];
    postBalances: number[];
    preTokenBalances: TokenBalance[];
    postTokenBalances: TokenBalance[];
    logMessages: string[];
    innerInstructions?: InnerInstruction[];
    loadedAddresses?: {
        readonly: string[];
        writable: string[];
    };
    rewards?: Reward[];
    status?: {
        Ok?: null;
        Err?: unknown;
    };
}
export interface InnerInstruction {
    index: number;
    instructions: CompiledInstruction[];
}
export interface CompiledInstruction {
    programIdIndex: number;
    accounts: number[];
    data: string;
}
export interface TokenBalance {
    accountIndex: number;
    mint: string;
    owner?: string;
    uiTokenAmount: {
        amount: string;
        decimals: number;
        uiAmount: number | null;
        uiAmountString: string;
    };
}
export interface Reward {
    pubkey: string;
    lamports: number;
    postBalance: number;
    rewardType?: 'fee' | 'rent' | 'staking' | string;
    commission?: number;
}
/**
 * Your insert format
 */
export interface LogDataInsertParams {
    signature: SigLike;
    slot: IntLike;
    program_id: AddressLike;
    logs_b64: string;
    signatures?: AddressLike[];
}
/**
 * Transform Solana transaction response to your insert format
 *
 * @param signature - Transaction signature (from your request params)
 * @param response - Response from connection.getTransaction(signature)
 * @returns Data ready for insert()
 */
export declare function transformSolanaTransaction(params: {
    signature: SigLike;
    tx: SolanaTransactionResponse | null;
}): LogDataInsertParams;
/**
 * If you want to filter by specific program
 */
export declare function transformSolanaTransactionForProgram(options: GetTxnResponseTranscription): LogDataInsertParams | null;
export declare function debugSolanaTransaction(response: SolanaTransactionResponse): void;
/**
 * Example: Fetching and inserting a transaction
 */
export declare function fetchAndInsertTransaction(connection: any, // Your Solana connection
signature: SigLike, repo: any): Promise<number | string>;
