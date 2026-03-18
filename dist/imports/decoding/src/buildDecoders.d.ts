/**
 * Registry builder for Anchor IDL v0.30+ format.
 *
 * IDL Structure:
 *   instructions: [{name, discriminator: [u8;8], accounts, args: [{name, type}]}]
 *   accounts:     [{name, discriminator: [u8;8]}]  // fields in types section
 *   events:       [{name, discriminator: [u8;8]}]  // fields in types section
 *   types:        [{name, type: {kind, fields}}]
 *   errors:       [{code, name, msg}]
 */
export type TypeSpec = string | {
    defined: string | {
        name: string;
    };
} | {
    option: TypeSpec;
} | {
    vec: TypeSpec;
} | {
    array: [TypeSpec, number];
};
export interface FieldDef {
    name: string;
    type: TypeSpec;
}
export interface TypeDef {
    name: string;
    type: {
        kind: "struct" | "enum";
        fields?: FieldDef[] | string[];
        variants?: {
            name: string;
        }[];
    };
}
export interface InstructionDef {
    name: string;
    discriminator?: number[];
    docs?: string[];
    accounts?: unknown[];
    args?: FieldDef[];
}
export interface EventDef {
    name: string;
    discriminator?: number[];
}
export interface AccountDef {
    name: string;
    discriminator?: number[];
}
export interface ErrorDef {
    code: number;
    name: string;
    msg?: string;
}
export interface AnchorIDL {
    version: string;
    name: string;
    instructions?: InstructionDef[];
    accounts?: AccountDef[];
    events?: EventDef[];
    types?: TypeDef[];
    errors?: ErrorDef[];
    metadata?: {
        address: string;
    };
}
export type Reader = (buf: Buffer, offset: number) => [unknown, number];
export type Decoder = (raw: Buffer) => Record<string, unknown>;
export declare class TypeResolver {
    private typesMap;
    private cache;
    constructor(types: TypeDef[]);
    getReader(typeSpec: TypeSpec): Reader;
    buildStructReader(typeName: string): Reader;
    private makeOptionReader;
    private makeVecReader;
    private makeArrayReader;
}
export declare function discFromArray(arr: number[]): Buffer;
export declare function discToHex(disc: Buffer): string;
export declare function discFromHex(hex: string): Buffer;
interface RegisteredDecoder {
    name: string;
    decoder: Decoder;
}
interface UnifiedEntry extends RegisteredDecoder {
    category: "instruction" | "event" | "account";
}
export declare class DecoderRegistry {
    instructions: Map<string, RegisteredDecoder>;
    events: Map<string, RegisteredDecoder>;
    accounts: Map<string, RegisteredDecoder>;
    errors: Map<number, ErrorDef>;
    unified: Map<string, UnifiedEntry>;
    resolver: TypeResolver | null;
    registerIdl(idl: AnchorIDL): void;
    decode(raw: Buffer): {
        name: string;
        category: string;
        data: Record<string, unknown>;
    } | null;
    decodeEvent(raw: Buffer): {
        name: string;
        data: Record<string, unknown>;
    } | null;
    decodeInstruction(raw: Buffer): {
        name: string;
        data: Record<string, unknown>;
    } | null;
    decodeAccount(raw: Buffer): {
        name: string;
        data: Record<string, unknown>;
    } | null;
    getError(code: number): ErrorDef | undefined;
    listEvents(): Array<[string, string]>;
    listInstructions(): Array<[string, string]>;
    listAccounts(): Array<[string, string]>;
}
export declare function buildRegistryFromIdl(idl: AnchorIDL): DecoderRegistry;
export declare function buildRegistryFromIdls(idls: any): DecoderRegistry;
export declare function buildDiscriminatorTable(idl: AnchorIDL): Record<string, string>;
export declare function printDiscriminatorTable(idl: AnchorIDL): void;
export declare function decodeBase64(b64: string): Buffer;
export declare function decodeBase64Event(registry: DecoderRegistry, b64: string): {
    name: string;
    data: Record<string, unknown>;
} | null;
export declare function decodeBase64Instruction(registry: DecoderRegistry, b64: string): {
    name: string;
    data: Record<string, unknown>;
} | null;
export declare function decodeBase64Any(registry: DecoderRegistry, b64: string): {
    name: string;
    category: string;
    data: Record<string, unknown>;
} | null;
export {};
