export declare function readPubkey(buf: Buffer, offset: number): string;
export declare function isValidBase58(value: unknown, minLen?: number, maxLen?: number): value is string;
export declare function normalizeBase58(input: unknown, label?: string): string;
export declare function normalizeTxnContext(txnMsg: any): any;
