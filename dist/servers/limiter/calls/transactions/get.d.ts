import type { SolanaTransactionResponse, FetchTxnParams, RepoResult, LogDataInsertParams, FetchedTransaction } from '@imports';
export declare function fetchTransactionRaw(options: FetchTxnParams): Promise<SolanaTransactionResponse | null>;
export declare function fetchTransaction(options: FetchTxnParams): Promise<RepoResult<FetchedTransaction>>;
export declare function fetchTxnInsertData(options: FetchTxnParams): Promise<LogDataInsertParams>;
