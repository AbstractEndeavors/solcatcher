import { LogPayloadInsert } from './imports.js';
// Schema for decoded program data with payload
export class ProgramDataEntry {
    raw;
    decoded;
    payload;
    discriminator;
    constructor(raw, // Base64 string
    decoded, // Decoded bytes
    payload, // Parsed payload from registry
    discriminator // Extracted discriminator
    ) {
        this.raw = raw;
        this.decoded = decoded;
        this.payload = payload;
        this.discriminator = discriminator;
    }
}
export class DecodedLogs {
    logs;
    constructor(logs) {
        this.logs = logs;
    }
    static fromBase64(logsB64) {
        const decodedJson = Buffer.from(logsB64, 'base64').toString('utf-8');
        const logs = JSON.parse(decodedJson);
        return new DecodedLogs(logs);
    }
    filterByProgram(programId) {
        return this.logs.filter(log => log.includes(programId));
    }
    getInstructions() {
        return this.logs.filter(log => log.includes('Instruction:'));
    }
    getProgramData() {
        return this.logs
            .filter(log => log.includes('Program data:'))
            .map(log => log.replace('Program data: ', ''));
    }
    getInvocations() {
        return this.logs.filter(log => log.includes('invoke'));
    }
    // Decode program data with registry
    getDecodedProgramData(REGISTRY) {
        const programData = this.getProgramData();
        const decoded = [];
        for (const b64 of programData) {
            const buffer = Buffer.from(b64, 'base64');
            try {
                const payload = REGISTRY.decode(buffer);
                // Extract discriminator (first 8 bytes as hex)
                const discriminator = buffer.slice(0, 8).toString('hex');
                decoded.push(new ProgramDataEntry(b64, buffer, payload, discriminator));
            }
            catch (err) {
                console.error('Failed to decode program data:', err);
            }
        }
        return decoded;
    }
    // ✅ NEW: Create insert payloads from decoded program data
    createInsertPayloads(params) {
        const decodedEntries = this.getDecodedProgramData(params.REGISTRY);
        const inserts = [];
        for (let i = 0; i < decodedEntries.length; i++) {
            const entry = decodedEntries[i];
            // Determine if decodable
            const decodable = entry.payload !== null && entry.payload !== undefined;
            // Extract event name if available
            const event = entry.payload?.name || entry.payload?.type || null;
            // Create insert schema
            const insert = new LogPayloadInsert(params.signature, params.programId, entry.discriminator, entry.decoded.length, event, params.depth || 0, i, // invocation_index
            null, // reported_invocation
            params.parentProgramId || null, params.parentEvent || null, entry.raw, decodable);
            inserts.push(insert);
        }
        return inserts;
    }
    // Advanced: track invocation depth and parent relationships
    createInsertPayloadsWithContext(params) {
        const invocations = this.getInvocations();
        const decodedEntries = this.getDecodedProgramData(params.REGISTRY);
        const inserts = [];
        // Track invocation depth from logs
        let depth = 0;
        let parentProgramId = null;
        for (let i = 0; i < decodedEntries.length; i++) {
            const entry = decodedEntries[i];
            // Extract depth from corresponding invocation log if available
            if (i < invocations.length) {
                const invocationMatch = invocations[i].match(/\[(\d+)\]/);
                if (invocationMatch) {
                    depth = parseInt(invocationMatch[1], 10);
                }
                // Extract parent program from invocation log
                const programMatch = invocations[i].match(/Program (\w+) invoke/);
                if (programMatch) {
                    parentProgramId = programMatch[1];
                }
            }
            const decodable = entry.payload !== null && entry.payload !== undefined;
            const event = entry.payload?.name || entry.payload?.type || null;
            const insert = new LogPayloadInsert(params.signature, params.programId, entry.discriminator, entry.decoded.length, event, depth, i, null, parentProgramId, null, entry.raw, decodable);
            inserts.push(insert);
        }
        return inserts;
    }
}
// ============================================================
// SERVICE ORCHESTRATION
// ============================================================
/*const REGISTRY = initializeRegistry();
const {logPayloadRepo, logDataRepo} = await getRepoServices.repos();

for (let id = 10099000; id < 10099249; id++) {
    const logData = await logDataRepo.fetchById(id);
    if (logData){
        const decodedLogs = DecodedLogs.fromBase64(logData.logs_b64);
        
        // Create insert payloads (explicit parameters)
        const insertPayloads = decodedLogs.createInsertPayloadsWithContext({
            signature: logData.signature,
            programId: logData.program_id as string,
            REGISTRY: REGISTRY,

        });
        
        // Explicit insertion
        await logPayloadRepo.insertBatch(insertPayloads);
        
        console.log(`Inserted ${insertPayloads.length} payloads for signature ${logData.signature}`);
    }
}*/ 
