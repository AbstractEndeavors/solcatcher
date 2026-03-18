// solana_tx_transformer.ts
// ═══════════════════════════════════════════════════════════════════
// TRANSFORMS SOLANA getTransaction RESPONSE → YOUR INSERT FORMAT
// ═══════════════════════════════════════════════════════════════════
import type {SigLike,IntLike,AddressLike,GetTxnResponseTranscription,RepoResult} from '@imports';
/**
 * Solana getTransaction response structure
 */
export interface SolanaTransactionResponse {
  blockTime: number | null;
  slot: number;
  version: number | 'legacy';

  transaction: [
    string,           // base64 transaction data
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
  data: string; // base64
}
export interface TokenBalance {
  accountIndex: number;
  mint: string;

  owner?: string;

  uiTokenAmount: {
    amount: string;      // raw integer as string
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
 * Extract program_id from log messages
 * Finds the first top-level program invocation
 */
function extractProgramId(logMessages: string[]): string | null {
  for (const log of logMessages) {
    // Match: "Program <program_id> invoke [1]"
    const match = log.match(/^Program ([1-9A-HJ-NP-Za-km-z]{32,44}) invoke \[1\]$/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Convert log messages array to base64
 */
function logsToBase64(logMessages: string[]): string {
  // Join logs with newlines
  const logsText = logMessages.join('\n');
  
  // Convert to base64
  return Buffer.from(logsText, 'utf-8').toString('base64');
}

/**
 * Transform Solana transaction response to your insert format
 * 
 * @param signature - Transaction signature (from your request params)
 * @param response - Response from connection.getTransaction(signature)
 * @returns Data ready for insert()
 */
export function transformSolanaTransaction(params: {
  signature: SigLike;
  tx: SolanaTransactionResponse | null;
}): RepoResult<LogDataInsertParams> {
  const { signature, tx } = params;

  if (!tx) {
    return { ok: false, reason: 'transaction_null', meta: { signature } };
  }
  if (!tx.meta) {
    return { ok: false, reason: 'transaction_meta_null', meta: { signature, slot: tx.slot } };
  }
  if (!tx.meta.logMessages?.length) {
    return { ok: false, reason: 'transaction_no_logs', meta: { signature, slot: tx.slot } };
  }

  const program_id = extractProgramId(tx.meta.logMessages);
  if (!program_id) {
    return { ok: false, reason: 'program_id_not_found', meta: { signature } };
  }

  return {
    ok: true,
    value: {
      signature,
      slot: tx.slot,
      program_id,
      logs_b64: logsToBase64(tx.meta.logMessages),
    },
  };
}

/**
 * Example usage:
 * 
 * const signature = '5vX...'; // The signature you used in getTransaction
 * const response = await connection.getTransaction(signature, {
 *   maxSupportedTransactionVersion: 0,
 *   commitment: 'confirmed'
 * });
 * 
 * const insertData = transformSolanaTransaction(signature, response);
 * const id = await insert(repo, insertData);
 */

// ═══════════════════════════════════════════════════════════════════
// ALTERNATIVE: If you want to extract ALL program invocations
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract all unique programs from logs (not just first)
 */
function extractAllProgramIds(logMessages: string[]): string[] {
  const programs = new Set<string>();
  
  for (const log of logMessages) {
    const match = log.match(/^Program ([1-9A-HJ-NP-Za-km-z]{32,44}) invoke/);
    if (match) {
      programs.add(match[1]);
    }
  }
  
  return Array.from(programs);
}

/**
 * If you want to filter by specific program
 */
export function transformSolanaTransactionForProgram(
  options:GetTxnResponseTranscription
): LogDataInsertParams | null {
  if (!options || !options.response) {
    throw new Error('Invalid Solana transaction response');
  }

  const allPrograms = extractAllProgramIds(options.response.logMessages);
  
  // Check if target program is in this transaction
  if (!allPrograms.includes(targetProgramId)) {
    return null; // Skip this transaction
  }

  const logs_b64 = logsToBase64(response.meta.logMessages);

  return {
    signature,
    slot: response.slot,
    program_id: targetProgramId,
    logs_b64,
  };
}

// ═══════════════════════════════════════════════════════════════════
// DEBUGGING HELPER
// ═══════════════════════════════════════════════════════════════════

export function debugSolanaTransaction(response: SolanaTransactionResponse): void {
  console.log('═══ Transaction Debug ═══');
  console.log('Slot:', response.slot);
  console.log('Block Time:', new Date((response.blockTime || 0) * 1000).toISOString());
  console.log('Version:', response.version);
  console.log('\nTransaction Data (base64):');
  console.log('  Length:', response.transaction[0].length, 'chars');
  console.log('  First 100:', response.transaction[0].slice(0, 100) + '...');
  console.log('\nPrograms Invoked:');
  const programs = extractAllProgramIds(response.meta.logMessages);
  programs.forEach(p => console.log('  -', p));
  console.log('\nLog Messages:', response.meta.logMessages.length, 'lines');
  console.log('First 5 logs:');
  response.meta.logMessages.slice(0, 5).forEach((log, i) => {
    console.log(`  ${i + 1}. ${log}`);
  });
  
  if (response.meta.err) {
    console.log('\n⚠️  Transaction FAILED:', response.meta.err);
  }
}

// ═══════════════════════════════════════════════════════════════════
// ACTUAL USAGE IN YOUR PIPELINE
// ═══════════════════════════════════════════════════════════════════

/**
 * Example: Fetching and inserting a transaction
 */
export async function fetchAndInsertTransaction(
  connection: any, // Your Solana connection
  signature: SigLike,
  repo: any // Your LogDataRepository
): Promise<number | string> {
  // Fetch transaction
  const response = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed'
  });

  if (!response) {
    throw new Error(`Transaction not found: ${signature}`);
  }

  // Debug (optional)
  debugSolanaTransaction(response);

  // Transform
  const insertData = transformSolanaTransaction(signature, response);

  // Insert
  const id = await repo.insert(insertData);
  
  return id;
}
