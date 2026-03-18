/**
 * Master decoder module exports.
 */
export type { DecodeError } from "./src/schema.js";
export { createDecodeError } from "./src/schema.js";
export { EventRegistry, InstructionRegistry } from "./src/registry.js";
export { DecoderEnvironment, IdlDecoderEnvironment, getDecoderEnv, getIdlDecoderEnv, initIdlDecoderEnv, } from "./src/environment.js";
export type { TypeSpec, FieldDef, TypeDef, InstructionDef, EventDef, AccountDef, ErrorDef, AnchorIDL, Reader, Decoder, } from "./src/buildDecoders.js";
export { TypeResolver, DecoderRegistry, buildRegistryFromIdl, buildRegistryFromIdls, discFromArray, discToHex, discFromHex, buildDiscriminatorTable, printDiscriminatorTable, decodeBase64, decodeBase64Event, decodeBase64Instruction, decodeBase64Any, } from "./src/buildDecoders.js";
export { initializeRegistry, getDecodeFromPayload, DECODER_REGISTRY } from './main.js';
