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
import bs58 from "bs58";
// =============================================================================
// PRIMITIVE READERS
// =============================================================================
function readPubkey(buf, o) {
    return [bs58.encode(buf.subarray(o, o + 32)), o + 32];
}
function readU8(buf, o) {
    return [buf.readUInt8(o), o + 1];
}
function readU16(buf, o) {
    return [buf.readUInt16LE(o), o + 2];
}
function readU32(buf, o) {
    return [buf.readUInt32LE(o), o + 4];
}
function readU64(buf, o) {
    return [buf.readBigUInt64LE(o), o + 8];
}
function readU128(buf, o) {
    const lo = buf.readBigUInt64LE(o);
    const hi = buf.readBigUInt64LE(o + 8);
    return [(hi << 64n) | lo, o + 16];
}
function readI64(buf, o) {
    return [buf.readBigInt64LE(o), o + 8];
}
function readI128(buf, o) {
    const lo = buf.readBigUInt64LE(o);
    const hi = buf.readBigInt64LE(o + 8);
    return [(hi << 64n) | lo, o + 16];
}
function readBool(buf, o) {
    return [buf.readUInt8(o) !== 0, o + 1];
}
function readString(buf, o) {
    const len = buf.readUInt32LE(o);
    o += 4;
    return [buf.subarray(o, o + len).toString("utf-8"), o + len];
}
const PRIMITIVE_READERS = {
    pubkey: readPubkey,
    publicKey: readPubkey,
    u8: readU8,
    u16: readU16,
    u32: readU32,
    u64: readU64,
    u128: readU128,
    i8: readU8,
    i16: readU16,
    i32: readU32,
    i64: readI64,
    i128: readI128,
    bool: readBool,
    string: readString,
};
// =============================================================================
// TYPE RESOLVER
// =============================================================================
export class TypeResolver {
    typesMap;
    cache = new Map();
    constructor(types) {
        this.typesMap = new Map(types.map((t) => [t.name, t]));
    }
    getReader(typeSpec) {
        if (typeof typeSpec === "string") {
            if (PRIMITIVE_READERS[typeSpec]) {
                return PRIMITIVE_READERS[typeSpec];
            }
            if (this.typesMap.has(typeSpec)) {
                return this.buildStructReader(typeSpec);
            }
            throw new Error(`Unknown type: ${typeSpec}`);
        }
        if ("defined" in typeSpec) {
            const defined = typeSpec.defined;
            const typeName = typeof defined === "string" ? defined : defined.name;
            return this.buildStructReader(typeName);
        }
        if ("option" in typeSpec) {
            return this.makeOptionReader(this.getReader(typeSpec.option));
        }
        if ("vec" in typeSpec) {
            return this.makeVecReader(this.getReader(typeSpec.vec));
        }
        if ("array" in typeSpec) {
            const [innerType, size] = typeSpec.array;
            return this.makeArrayReader(this.getReader(innerType), size);
        }
        throw new Error(`Unknown complex type: ${JSON.stringify(typeSpec)}`);
    }
    buildStructReader(typeName) {
        if (this.cache.has(typeName)) {
            return this.cache.get(typeName);
        }
        const typeDef = this.typesMap.get(typeName);
        if (!typeDef) {
            throw new Error(`Type not found: ${typeName}`);
        }
        const { kind, fields, variants } = typeDef.type;
        if (kind === "struct") {
            const fieldList = fields || [];
            // Tuple struct: {"fields": ["bool"]}
            if (fieldList.length > 0 && typeof fieldList[0] === "string") {
                const innerReader = this.getReader(fieldList[0]);
                this.cache.set(typeName, innerReader);
                return innerReader;
            }
            // Named struct
            const fieldReaders = fieldList.map((f) => [
                f.name,
                this.getReader(f.type),
            ]);
            const structReader = (buf, o) => {
                const out = {};
                for (const [name, reader] of fieldReaders) {
                    [out[name], o] = reader(buf, o);
                }
                return [out, o];
            };
            this.cache.set(typeName, structReader);
            return structReader;
        }
        if (kind === "enum") {
            const variantList = variants || [];
            const enumReader = (buf, o) => {
                const idx = buf.readUInt8(o);
                o += 1;
                const variant = idx < variantList.length ? variantList[idx].name : idx;
                return [{ variant }, o];
            };
            this.cache.set(typeName, enumReader);
            return enumReader;
        }
        throw new Error(`Unsupported type kind: ${kind} for ${typeName}`);
    }
    makeOptionReader(inner) {
        return (buf, o) => {
            const isSome = buf.readUInt8(o) !== 0;
            o += 1;
            return isSome ? inner(buf, o) : [null, o];
        };
    }
    makeVecReader(inner) {
        return (buf, o) => {
            const length = buf.readUInt32LE(o);
            o += 4;
            const items = [];
            for (let i = 0; i < length; i++) {
                let item;
                [item, o] = inner(buf, o);
                items.push(item);
            }
            return [items, o];
        };
    }
    makeArrayReader(inner, size) {
        return (buf, o) => {
            const items = [];
            for (let i = 0; i < size; i++) {
                let item;
                [item, o] = inner(buf, o);
                items.push(item);
            }
            return [items, o];
        };
    }
}
// =============================================================================
// DISCRIMINATOR UTILITIES
// =============================================================================
export function discFromArray(arr) {
    return Buffer.from(arr);
}
export function discToHex(disc) {
    return disc.toString("hex");
}
export function discFromHex(hex) {
    return Buffer.from(hex, "hex");
}
// =============================================================================
// DECODER BUILDERS
// =============================================================================
function buildInstructionDecoder(ixDef, resolver) {
    const args = ixDef.args || [];
    const fieldReaders = args.map((arg) => [
        arg.name,
        resolver.getReader(arg.type),
    ]);
    return (raw) => {
        let o = 8;
        const out = {};
        for (const [name, reader] of fieldReaders) {
            [out[name], o] = reader(raw, o);
        }
        return out;
    };
}
function buildTypeDecoder(typeName, resolver) {
    const inner = resolver.buildStructReader(typeName);
    return (raw) => {
        const [result] = inner(raw, 8);
        return result;
    };
}
export class DecoderRegistry {
    instructions = new Map();
    events = new Map();
    accounts = new Map();
    errors = new Map();
    unified = new Map();
    resolver = null;
    registerIdl(idl) {
        const types = idl.types || [];
        this.resolver = new TypeResolver(types);
        for (const ix of idl.instructions || []) {
            if (!ix.discriminator)
                continue;
            const disc = discToHex(discFromArray(ix.discriminator));
            try {
                const decoder = buildInstructionDecoder(ix, this.resolver);
                this.instructions.set(disc, { name: ix.name, decoder });
                this.unified.set(disc, { name: ix.name, category: "instruction", decoder });
            }
            catch (e) {
                console.warn(`Skipping instruction ${ix.name}: ${e}`);
            }
        }
        for (const event of idl.events || []) {
            if (!event.discriminator)
                continue;
            const disc = discToHex(discFromArray(event.discriminator));
            try {
                const decoder = buildTypeDecoder(event.name, this.resolver);
                this.events.set(disc, { name: event.name, decoder });
                this.unified.set(disc, { name: event.name, category: "event", decoder });
            }
            catch (e) {
                console.warn(`Skipping event ${event.name}: ${e}`);
            }
        }
        for (const acc of idl.accounts || []) {
            if (!acc.discriminator)
                continue;
            const disc = discToHex(discFromArray(acc.discriminator));
            try {
                const decoder = buildTypeDecoder(acc.name, this.resolver);
                this.accounts.set(disc, { name: acc.name, decoder });
                this.unified.set(disc, { name: acc.name, category: "account", decoder });
            }
            catch (e) {
                console.warn(`Skipping account ${acc.name}: ${e}`);
            }
        }
        for (const err of idl.errors || []) {
            this.errors.set(err.code, err);
        }
    }
    decode(raw) {
        const disc = raw.subarray(0, 8).toString("hex");
        const entry = this.unified.get(disc);
        if (!entry)
            return null;
        return { name: entry.name, category: entry.category, data: entry.decoder(raw) };
    }
    decodeEvent(raw) {
        const disc = raw.subarray(0, 8).toString("hex");
        const entry = this.events.get(disc);
        if (!entry)
            return null;
        return { name: entry.name, data: entry.decoder(raw) };
    }
    decodeInstruction(raw) {
        const disc = raw.subarray(0, 8).toString("hex");
        const entry = this.instructions.get(disc);
        if (!entry)
            return null;
        return { name: entry.name, data: entry.decoder(raw) };
    }
    decodeAccount(raw) {
        const disc = raw.subarray(0, 8).toString("hex");
        const entry = this.accounts.get(disc);
        if (!entry)
            return null;
        return { name: entry.name, data: entry.decoder(raw) };
    }
    getError(code) {
        return this.errors.get(code);
    }
    listEvents() {
        return [...this.events.entries()].map(([disc, { name }]) => [name, disc]);
    }
    listInstructions() {
        return [...this.instructions.entries()].map(([disc, { name }]) => [name, disc]);
    }
    listAccounts() {
        return [...this.accounts.entries()].map(([disc, { name }]) => [name, disc]);
    }
}
// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================
export function buildRegistryFromIdl(idl) {
    const registry = new DecoderRegistry();
    registry.registerIdl(idl);
    return registry;
}
export function buildRegistryFromIdls(idls) {
    const registry = new DecoderRegistry();
    for (const idl of idls) {
        if (idl)
            registry.registerIdl(idl);
    }
    return registry;
}
// =============================================================================
// DISCRIMINATOR TABLE
// =============================================================================
export function buildDiscriminatorTable(idl) {
    const table = {};
    for (const ix of idl.instructions || []) {
        if (ix.discriminator) {
            table[`instruction:${ix.name}`] = Buffer.from(ix.discriminator).toString("hex");
        }
    }
    for (const event of idl.events || []) {
        if (event.discriminator) {
            table[`event:${event.name}`] = Buffer.from(event.discriminator).toString("hex");
        }
    }
    for (const acc of idl.accounts || []) {
        if (acc.discriminator) {
            table[`account:${acc.name}`] = Buffer.from(acc.discriminator).toString("hex");
        }
    }
    return table;
}
export function printDiscriminatorTable(idl) {
    const table = buildDiscriminatorTable(idl);
    for (const [name, disc] of Object.entries(table).sort()) {
        console.log(`${disc}  ${name}`);
    }
}
// =============================================================================
// BASE64 HELPERS
// =============================================================================
export function decodeBase64(b64) {
    return Buffer.from(b64, "base64");
}
export function decodeBase64Event(registry, b64) {
    return registry.decodeEvent(decodeBase64(b64));
}
export function decodeBase64Instruction(registry, b64) {
    return registry.decodeInstruction(decodeBase64(b64));
}
export function decodeBase64Any(registry, b64) {
    return registry.decode(decodeBase64(b64));
}
