/**
 * Master decoder module exports.
 */
export type { DecodeError } from "./schema.js";
export { createDecodeError } from "./schema.js";
export { EventRegistry, InstructionRegistry } from "./registry.js";
export { DecoderEnvironment, IdlDecoderEnvironment, getDecoderEnv, getIdlDecoderEnv, initIdlDecoderEnv, } from "./environment.js";
export type { TypeSpec, FieldDef, TypeDef, InstructionDef, EventDef, AccountDef, ErrorDef, AnchorIDL, Reader, Decoder, } from "./buildDecoders.js";
export { TypeResolver, DecoderRegistry, buildRegistryFromIdl, buildRegistryFromIdls, discFromArray, discToHex, discFromHex, buildDiscriminatorTable, printDiscriminatorTable, decodeBase64, decodeBase64Event, decodeBase64Instruction, decodeBase64Any, } from "./buildDecoders.js";
