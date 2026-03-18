/**
 * Master decoder module exports.
 */
export { createDecodeError } from "./src/schema.js";
// Registry classes
export { EventRegistry, InstructionRegistry } from "./src/registry.js";
// Environment classes
export { DecoderEnvironment, IdlDecoderEnvironment, getDecoderEnv, getIdlDecoderEnv, initIdlDecoderEnv, } from "./src/environment.js";
export { 
// Classes
TypeResolver, DecoderRegistry, 
// Factory functions
buildRegistryFromIdl, buildRegistryFromIdls, 
// Utilities
discFromArray, discToHex, discFromHex, buildDiscriminatorTable, printDiscriminatorTable, 
// Base64 helpers
decodeBase64, decodeBase64Event, decodeBase64Instruction, decodeBase64Any, } from "./src/buildDecoders.js";
export { initializeRegistry, getDecodeFromPayload, DECODER_REGISTRY } from './main.js';
