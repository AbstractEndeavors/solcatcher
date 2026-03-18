/**
 * Extract program_id from log messages
 * Finds the first top-level program invocation
 */
function extractProgramId(logMessages) {
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
function logsToBase64(logMessages) {
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
export function transformSolanaTransaction(params) {
    const { signature, tx } = params;
    if (!tx || !tx.meta) {
        throw new Error('Invalid Solana transaction response');
    }
    // Extract program_id from logs
    const program_id = extractProgramId(tx.meta.logMessages);
    if (!program_id) {
        throw new Error('Could not extract program_id from logs');
    }
    // Convert logs to base64
    const logs_b64 = logsToBase64(tx.meta.logMessages);
    return {
        signature,
        slot: tx.slot,
        program_id,
        logs_b64,
        // Note: Your insert has 'signatures' array but unclear what this is
        // If this should be all signature accounts from the transaction, 
        // you'd need to decode transaction[0] to extract them
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
function extractAllProgramIds(logMessages) {
    const programs = new Set();
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
export function transformSolanaTransactionForProgram(options) {
    if (!response || !response.meta) {
        throw new Error('Invalid Solana transaction response');
    }
    const allPrograms = extractAllProgramIds(response.meta.logMessages);
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
export function debugSolanaTransaction(response) {
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
export async function fetchAndInsertTransaction(connection, // Your Solana connection
signature, repo // Your LogDataRepository
) {
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
