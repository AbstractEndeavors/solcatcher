import { LogPayloadInsert} from './imports.js';


// Schema for decoded program data with payload
export class ProgramDataEntry {
    constructor(
        public readonly raw: string,           // Base64 string
        public readonly decoded: Buffer,       // Decoded bytes
        public readonly payload: any,          // Parsed payload from registry
        public readonly discriminator: string  // Extracted discriminator
    ) {}
}

export class DecodedLogs {
    constructor(public readonly logs: string[]) {}
    
    static fromBase64(logsB64: string): DecodedLogs {
        const decodedJson = Buffer.from(logsB64, 'base64').toString('utf-8');
        const logs: string[] = JSON.parse(decodedJson);
        return new DecodedLogs(logs);
    }
    
    filterByProgram(programId: string): string[] {
        return this.logs.filter(log => log.includes(programId));
    }
    
    getInstructions(): string[] {
        return this.logs.filter(log => log.includes('Instruction:'));
    }
    
    getProgramData(): string[] {
        return this.logs
            .filter(log => log.includes('Program data:'))
            .map(log => log.replace('Program data: ', ''));
    }
    
    getInvocations(): string[] {
        return this.logs.filter(log => log.includes('invoke'));
    }
    
    // Decode program data with registry
    getDecodedProgramData(REGISTRY: any): ProgramDataEntry[] {
        const programData = this.getProgramData();
        const decoded: ProgramDataEntry[] = [];
        
        for (const b64 of programData) {
            const buffer = Buffer.from(b64, 'base64');
            
            try {
                const payload = REGISTRY.decode(buffer);
                
                // Extract discriminator (first 8 bytes as hex)
                const discriminator = buffer.slice(0, 8).toString('hex');
                
                decoded.push(new ProgramDataEntry(b64, buffer, payload, discriminator));
            } catch (err) {
                console.error('Failed to decode program data:', err);
            }
        }
        
        return decoded;
    }
    
    // ✅ NEW: Create insert payloads from decoded program data
    createInsertPayloads(params: {
        signature: string;
        programId: string;
        REGISTRY: any;
        depth?: number;
        parentProgramId?: string | null;
        parentEvent?: string | null;
    }): LogPayloadInsert[] {
        const decodedEntries = this.getDecodedProgramData(params.REGISTRY);
        const inserts: LogPayloadInsert[] = [];
        
        for (let i = 0; i < decodedEntries.length; i++) {
            const entry = decodedEntries[i];
            
            // Determine if decodable
            const decodable = entry.payload !== null && entry.payload !== undefined;
            
            // Extract event name if available
            const event = entry.payload?.name || entry.payload?.type || null;
            
            // Create insert schema
            const insert = new LogPayloadInsert(
                params.signature,
                params.programId,
                entry.discriminator,
                entry.decoded.length,
                event,
                params.depth || 0,
                i,  // invocation_index
                null,  // reported_invocation
                params.parentProgramId || null,
                params.parentEvent || null,
                entry.raw,
                decodable
            );
            
            inserts.push(insert);
        }
        
        return inserts;
    }
    // Advanced: track invocation depth and parent relationships
    createInsertPayloadsWithContext(params: {
        signature: string;
        programId: string;
        REGISTRY: any;
    }): LogPayloadInsert[] {
        const invocations = this.getInvocations();
        const decodedEntries = this.getDecodedProgramData(params.REGISTRY);
        const inserts: LogPayloadInsert[] = [];
        
        // Track invocation depth from logs
        let depth = 0;
        let parentProgramId: string | null = null;
        
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
            
            const insert = new LogPayloadInsert(
                params.signature,
                params.programId,
                entry.discriminator,
                entry.decoded.length,
                event,
                depth,
                i,
                null,
                parentProgramId,
                null,
                entry.raw,
                decodable
            );
            
            inserts.push(insert);
        }
        
        return inserts;
    }
}


