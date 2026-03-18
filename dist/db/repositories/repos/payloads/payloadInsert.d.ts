import { LogPayloadInsert } from './imports.js';
export declare class ProgramDataEntry {
    readonly raw: string;
    readonly decoded: Buffer;
    readonly payload: any;
    readonly discriminator: string;
    constructor(raw: string, // Base64 string
    decoded: Buffer, // Decoded bytes
    payload: any, // Parsed payload from registry
    discriminator: string);
}
export declare class DecodedLogs {
    readonly logs: string[];
    constructor(logs: string[]);
    static fromBase64(logsB64: string): DecodedLogs;
    filterByProgram(programId: string): string[];
    getInstructions(): string[];
    getProgramData(): string[];
    getInvocations(): string[];
    getDecodedProgramData(REGISTRY: any): ProgramDataEntry[];
    createInsertPayloads(params: {
        signature: string;
        programId: string;
        REGISTRY: any;
        depth?: number;
        parentProgramId?: string | null;
        parentEvent?: string | null;
    }): LogPayloadInsert[];
    createInsertPayloadsWithContext(params: {
        signature: string;
        programId: string;
        REGISTRY: any;
    }): LogPayloadInsert[];
}
