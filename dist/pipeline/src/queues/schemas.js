// src/pipeline/queues/schemas-enhanced.ts
// ═══════════════════════════════════════════════════════════════════
// ENHANCED VALIDATION - TELLS YOU EXACTLY WHAT'S WRONG
// ═══════════════════════════════════════════════════════════════════
import { PipelineError } from '../errors/context.js';
// ────────────────────────────────────────────────────────
// PRIMITIVE VALIDATORS
// ────────────────────────────────────────────────────────
function validateString(field, value, allowEmpty = false) {
    if (typeof value !== 'string') {
        return {
            success: false,
            field,
            reason: `must be string, got ${typeof value}`,
            value,
        };
    }
    if (!allowEmpty && value.length === 0) {
        return {
            success: false,
            field,
            reason: 'must not be empty string',
            value,
        };
    }
    return { success: true, data: value };
}
function validateNumber(field, value) {
    if (typeof value !== 'number') {
        return {
            success: false,
            field,
            reason: `must be number, got ${typeof value}`,
            value,
        };
    }
    if (!Number.isFinite(value)) {
        return {
            success: false,
            field,
            reason: 'must be finite number',
            value,
        };
    }
    return { success: true, data: value };
}
function validateIdLike(field, value) {
    const numResult = validateNumber(field, value);
    if (numResult.success)
        return numResult;
    const strResult = validateString(field, value);
    if (strResult.success)
        return strResult;
    return {
        success: false,
        field,
        reason: 'must be number or string',
        value,
    };
}
function validateOptionalString(field, value) {
    if (value === null || value === undefined) {
        return { success: true, data: value };
    }
    return validateString(field, value, true);
}
function isObject(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
}
// ────────────────────────────────────────────────────────
// PAYLOAD VALIDATORS
// ────────────────────────────────────────────────────────
const validateLogIntake = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const checks = [
        validateString('program_id', x.program_id),
        validateString('signature', x.signature),
        validateNumber('slot', x.slot),
        validateString('logs_b64', x.logs_b64),
    ];
    for (const check of checks) {
        if (!check.success)
            return check;
    }
    return {
        success: true,
        data: x,
    };
};
const validateLogEntry = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const idCheck = validateIdLike('id', x.id);
    if (!idCheck.success)
        return idCheck;
    return { success: true, data: x };
};
const validateTxnEntry = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    // Either id or signature must be present
    if (!x.id && !x.signature) {
        return {
            success: false,
            field: 'id|signature',
            reason: 'must have either id or signature',
            value: x,
        };
    }
    return { success: true, data: x };
};
const validatePairEnrich = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const checks = [
        validateIdLike('pair_id', x.pair_id),
        validateString('mint', x.mint),
        validateString('program_id', x.program_id),
    ];
    for (const check of checks) {
        if (!check.success)
            return check;
    }
    return { success: true, data: x };
};
const validateMetaEnrich = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const checks = [
        validateIdLike('meta_id', x.meta_id),
        validateString('mint', x.mint),
        validateString('program_id', x.program_id),
        validateOptionalString('uri', x.uri),
    ];
    for (const check of checks) {
        if (!check.success)
            return check;
    }
    return { success: true, data: x };
};
const validateOnchainEnrich = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const checks = [
        validateIdLike('meta_id', x.meta_id),
        validateString('mint', x.mint),
        validateString('program_id', x.program_id),
    ];
    for (const check of checks) {
        if (!check.success)
            return check;
    }
    return { success: true, data: x };
};
const validateGenesisLookup = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const checks = [
        validateIdLike('pair_id', x.pair_id),
        validateString('mint', x.mint),
        validateString('program_id', x.program_id),
    ];
    for (const check of checks) {
        if (!check.success)
            return check;
    }
    return { success: true, data: x };
};
const validateSignatureCall = (x) => {
    if (!isObject(x)) {
        return { success: false, field: 'payload', reason: 'must be object', value: x };
    }
    const addressCheck = validateString('address', x.address);
    if (!addressCheck.success)
        return addressCheck;
    return { success: true, data: x };
};
// ────────────────────────────────────────────────────────
// VALIDATOR REGISTRY
// ────────────────────────────────────────────────────────
export const EnhancedValidators = {
    logIntake: validateLogIntake,
    logEntry: validateLogEntry,
    txnEntry: validateTxnEntry,
    pairEnrich: validatePairEnrich,
    metaEnrich: validateMetaEnrich,
    onchainEnrich: validateOnchainEnrich,
    genesisLookup: validateGenesisLookup,
    signatureCall: validateSignatureCall,
};
// ────────────────────────────────────────────────────────
// VALIDATION HELPER WITH DETAILED ERRORS
// ────────────────────────────────────────────────────────
export function validatePayloadEnhanced(queue, payload) {
    const validator = EnhancedValidators[queue];
    const result = validator(payload);
    if (!result.success) {
        throw new PipelineError(`Validation failed for queue "${queue}"`, {
            queue,
            phase: 'validation',
            field: result.field,
            reason: result.reason,
            value: result.value,
            payload,
        });
    }
    return result.data;
}
// ────────────────────────────────────────────────────────
// VALIDATOR REGISTRY
// ────────────────────────────────────────────────────────
export const PayloadValidators = {
    logIntake: validateLogIntake,
    logEntry: validateLogEntry,
    txnEntry: validateTxnEntry,
    pairEnrich: validatePairEnrich,
    metaEnrich: validateMetaEnrich,
    onchainEnrich: validateOnchainEnrich,
    genesisLookup: validateGenesisLookup,
    signatureCall: validateSignatureCall,
};
// ────────────────────────────────────────────────────────
// VALIDATION HELPER
// ────────────────────────────────────────────────────────
export function validatePayload(queue, payload) {
    const validator = PayloadValidators[queue];
    if (!validator(payload)) {
        throw new Error(`Invalid payload for queue "${queue}": ${JSON.stringify(payload).slice(0, 200)}`);
    }
    return payload;
}
