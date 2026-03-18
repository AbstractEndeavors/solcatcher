// src/pipeline/queues/schemas-enhanced.ts
// ═══════════════════════════════════════════════════════════════════
// ENHANCED VALIDATION - TELLS YOU EXACTLY WHAT'S WRONG
// ═══════════════════════════════════════════════════════════════════

import type {
  QueueName,
  QueuePayloadMap,
  LogIntakePayload,
  TxnEntryPayload,
  PairEnrichPayload,
  Identity,
  OnchainEnrichPayload,
  GenesisEntryPayload,
  SignatureCallPayload,
  RepoResult,
  LogDataRow,
  ClassifiedEvent,
  DecodedCreateEvents,
  DecodedTradeEvents,
  EnrichmentContext,
  InsertPairParams,
  EnrichedCreateMetaDataInsert,
  TransactionsInsertParams,
} from './imports.js';
import { PipelineError } from './errors.js';

/**
 * Validation result - either success with data or failure with details
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; field: string; reason: string; value: unknown };

/**
 * Enhanced validator that returns detailed errors
 */
export type EnhancedValidator<T> = (x: unknown) => ValidationResult<T>;

// ────────────────────────────────────────────────────────
// PRIMITIVE VALIDATORS
// ────────────────────────────────────────────────────────

function validateString(
  field: string,
  value: unknown,
  allowEmpty = false
): ValidationResult<string> {
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

function validateNumber(
  field: string,
  value: unknown
): ValidationResult<number> {
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

function validateBigInt(
  field: string,
  value: unknown
): ValidationResult<bigint> {
  if (typeof value !== 'bigint') {
    return {
      success: false,
      field,
      reason: `must be bigint, got ${typeof value}`,
      value,
    };
  }
  return { success: true, data: value };
}

function validateBoolean(
  field: string,
  value: unknown
): ValidationResult<boolean> {
  if (typeof value !== 'boolean') {
    return {
      success: false,
      field,
      reason: `must be boolean, got ${typeof value}`,
      value,
    };
  }
  return { success: true, data: value };
}

function validateDate(
  field: string,
  value: unknown
): ValidationResult<Date> {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return {
      success: false,
      field,
      reason: `must be valid Date, got ${typeof value}`,
      value,
    };
  }
  return { success: true, data: value };
}

function validateIdLike(
  field: string,
  value: unknown
): ValidationResult<number | string> {
  const numResult = validateNumber(field, value);
  if (numResult.success) return numResult;

  const strResult = validateString(field, value);
  if (strResult.success) return strResult;

  return {
    success: false,
    field,
    reason: 'must be number or string',
    value,
  };
}

function validateOptionalString(
  field: string,
  value: unknown
): ValidationResult<string | null | undefined> {
  if (value === null || value === undefined) {
    return { success: true, data: value };
  }

  return validateString(field, value, true);
}

function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

/** Run a list of checks; return first failure, or null if all pass */
function firstFailure(
  checks: ValidationResult<unknown>[]
): ValidationResult<never> | null {
  for (const check of checks) {
    if (!check.success) return check;
  }
  return null;
}

// ────────────────────────────────────────────────────────
// SHARED SUB-VALIDATORS
// ────────────────────────────────────────────────────────

function validateProvenance(x: Record<string, unknown>): ValidationResult<unknown> {
  if (!isObject(x.provenance)) {
    return {
      success: false,
      field: 'provenance',
      reason: 'must be object',
      value: x.provenance,
    };
  }

  const p = x.provenance;
  return (
    firstFailure([
      validateIdLike('provenance.payload_id', p.payload_id),
      validateString('provenance.signature', p.signature),
      validateString('provenance.program_id', p.program_id),
      validateString('provenance.discriminator', p.discriminator),
      validateIdLike('provenance.invocation_index', p.invocation_index),
      validateIdLike('provenance.depth', p.depth),
    ]) ?? { success: true, data: p }
  );
}

function validateIdentityFields(x: Record<string, unknown>): ValidationResult<never> | null {
  // Identity requires at least one of: mint, id, signature, program_id
  const hasAny = x.mint || x.id || x.signature || x.program_id;
  if (!hasAny) {
    return {
      success: false,
      field: 'mint|id|signature|program_id',
      reason: 'must have at least one identity field',
      value: x,
    };
  }
  return null;
}

// ────────────────────────────────────────────────────────
// PAYLOAD VALIDATORS — EXISTING
// ────────────────────────────────────────────────────────

const validateLogIntake: EnhancedValidator<LogIntakePayload> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateString('program_id', x.program_id),
    validateString('signature', x.signature),
    validateNumber('slot', x.slot),
    validateString('logs_b64', x.logs_b64),
  ]);

  return fail ?? { success: true, data: x as any };
};

const validateLogEntry: EnhancedValidator<RepoResult<LogDataRow>> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const idCheck = validateIdLike('id', x.id);
  if (!idCheck.success) return idCheck;

  return { success: true, data: x as any };
};

const validateTxnEntry: EnhancedValidator<ClassifiedEvent[]> = (x:any) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  if (!x.id && !x.signature) {
    return {
      success: false,
      field: 'id|signature',
      reason: 'must have either id or signature',
      value: x,
    };
  }

  return { success: true, data: x as TxnEntryPayload };
};

const validatePairEnrich: EnhancedValidator<PairEnrichPayload> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateIdLike('pair_id', x.pair_id),
    validateString('mint', x.mint),
    validateString('program_id', x.program_id),
  ]);

  return fail ?? { success: true, data: x as PairEnrichPayload };
};

const validateMetaEnrich: EnhancedValidator<Identity> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateIdLike('meta_id', x.meta_id),
    validateString('mint', x.mint),
    validateString('program_id', x.program_id),
    validateOptionalString('uri', x.uri),
  ]);

  return fail ?? { success: true, data: x as any };
};

const validateOnchainEnrich: EnhancedValidator<OnchainEnrichPayload> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateIdLike('meta_id', x.meta_id),
    validateString('mint', x.mint),
    validateString('program_id', x.program_id),
  ]);

  return fail ?? { success: true, data: x as any };
};

const validateGenesisLookup: EnhancedValidator<GenesisEntryPayload> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateIdLike('pair_id', x.pair_id),
    validateString('mint', x.mint),
    validateString('program_id', x.program_id),
  ]);

  return fail ?? { success: true, data: x as any };
};

const validateSignatureCall: EnhancedValidator<SignatureCallPayload> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const addressCheck = validateString('address', x.address);
  if (!addressCheck.success) return addressCheck;

  return { success: true, data: x as any };
};

// ────────────────────────────────────────────────────────
// PAYLOAD VALIDATORS — NEW
// ────────────────────────────────────────────────────────

const validateCreateEventEntry: EnhancedValidator<DecodedCreateEvents> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  if (x.kind !== 'create') {
    return { success: false, field: 'kind', reason: "must be 'create'", value: x.kind };
  }

  const provenanceCheck = validateProvenance(x);
  if (!provenanceCheck.success) return provenanceCheck;

  const fail = firstFailure([
    validateString('name', x.name),
    validateString('symbol', x.symbol),
    validateString('uri', x.uri),
    validateString('description', x.description),
    validateString('mint', x.mint),
    validateString('bonding_curve', x.bonding_curve),
    validateString('token_program', x.token_program),
    validateBigInt('virtual_token_reserves', x.virtual_token_reserves),
    validateBigInt('virtual_sol_reserves', x.virtual_sol_reserves),
    validateBigInt('real_token_reserves', x.real_token_reserves),
    validateBigInt('token_total_supply', x.token_total_supply),
    validateDate('timestamp', x.timestamp),
    validateBoolean('is_mayhem_mode', x.is_mayhem_mode),
  ]);

  return fail ?? { success: true, data: x as DecodedCreateEvents };
};

const validateTradeEventEntry: EnhancedValidator<DecodedTradeEvents> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  if (x.kind !== 'trade') {
    return { success: false, field: 'kind', reason: "must be 'trade'", value: x.kind };
  }

  const provenanceCheck = validateProvenance(x);
  if (!provenanceCheck.success) return provenanceCheck;

  const fail = firstFailure([
    validateBigInt('sol_amount', x.sol_amount),
    validateBigInt('token_amount', x.token_amount),
    validateBigInt('virtual_sol_reserves', x.virtual_sol_reserves),
    validateBigInt('virtual_token_reserves', x.virtual_token_reserves),
    validateBigInt('real_sol_reserves', x.real_sol_reserves),
    validateBigInt('real_token_reserves', x.real_token_reserves),
    validateBoolean('is_buy', x.is_buy),
    validateString('ix_name', x.ix_name),
    validateBoolean('mayhem_mode', x.mayhem_mode),
    validateBoolean('track_volume', x.track_volume),
    validateIdLike('total_unclaimed_tokens', x.total_unclaimed_tokens),
    validateIdLike('total_claimed_tokens', x.total_claimed_tokens),
    validateIdLike('current_sol_volume', x.current_sol_volume),
    validateString('fee_recipient', x.fee_recipient),
    validateIdLike('fee_basis_points', x.fee_basis_points),
    validateIdLike('fee', x.fee),
    validateString('creator', x.creator),
    validateIdLike('creator_fee_basis_points', x.creator_fee_basis_points),
    validateIdLike('creator_fee', x.creator_fee),
    validateIdLike('timestamp', x.timestamp),
    validateIdLike('last_update_timestamp', x.last_update_timestamp),
  ]);

  return fail ?? { success: true, data: x as DecodedTradeEvents };
};

const validateEnrichmentPipelineEntry: EnhancedValidator<EnrichmentContext> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const mintCheck = validateString('mint', x.mint);
  if (!mintCheck.success) return mintCheck;

  if (!isObject(x.pair)) {
    return { success: false, field: 'pair', reason: 'must be object (PairEnrichmentRow)', value: x.pair };
  }

  if (!isObject(x.meta)) {
    return { success: false, field: 'meta', reason: 'must be object (MetaDataEnrichmentRow)', value: x.meta };
  }

  if (!isObject(x.enrich_fields)) {
    return { success: false, field: 'enrich_fields', reason: 'must be object with pair/meta arrays', value: x.enrich_fields };
  }

  if (!Array.isArray((x.enrich_fields as any).pair) || !Array.isArray((x.enrich_fields as any).meta)) {
    return {
      success: false,
      field: 'enrich_fields.pair|meta',
      reason: 'both pair and meta must be arrays',
      value: x.enrich_fields,
    };
  }

  return { success: true, data: x as EnrichmentContext };
};

const validatePairGenesisInsert: EnhancedValidator<InsertPairParams> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateString('mint', x.mint),
    validateString('program_id', x.program_id),
    validateString('token_program', x.token_program),
    validateString('bonding_curve', x.bonding_curve),
    validateString('creator', x.creator),
    validateDate('timestamp', x.timestamp),
  ]);

  return fail ?? { success: true, data: x as InsertPairParams };
};

/** Shared validator for Identity-typed queues (offChainMetaDataEnrich, genesisEnrich, pairProvinenceEnrich) */
const validateIdentity: EnhancedValidator<Identity> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = validateIdentityFields(x);
  return fail ?? { success: true, data: x as Identity };
};

const validateMetaDataGenesisInsert: EnhancedValidator<EnrichedCreateMetaDataInsert> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    validateString('mint', x.mint),
    validateString('name', x.name),
    validateString('symbol', x.symbol),
    validateString('uri', x.uri),
  ]);

  return fail ?? { success: true, data: x as EnrichedCreateMetaDataInsert };
};

const validateTransactionInsert: EnhancedValidator<TransactionsInsertParams> = (x) => {
  if (!isObject(x)) {
    return { success: false, field: 'payload', reason: 'must be object', value: x };
  }

  const fail = firstFailure([
    // Provenance
    validateIdLike('log_id', x.log_id),
    validateIdLike('pair_id', x.pair_id),
    validateIdLike('meta_id', x.meta_id),
    // Identity
    validateString('signature', x.signature),
    validateString('program_id', x.program_id),
    validateIdLike('slot', x.slot),
    validateIdLike('invocation', x.invocation),
    // Asset
    validateString('mint', x.mint),
    validateString('user_address', x.user_address),
    // Trade
    validateBoolean('is_buy', x.is_buy),
    validateString('ix_name', x.ix_name),
    // Amounts
    validateIdLike('sol_amount', x.sol_amount),
    validateIdLike('token_amount', x.token_amount),
    // AMM state
    validateIdLike('virtual_sol_reserves', x.virtual_sol_reserves),
    validateIdLike('virtual_token_reserves', x.virtual_token_reserves),
    validateIdLike('real_sol_reserves', x.real_sol_reserves),
    validateIdLike('real_token_reserves', x.real_token_reserves),
    validateBoolean('mayhem_mode', x.mayhem_mode),
    // Pricing
    validateIdLike('price', x.price),
    // Volume
    validateBoolean('track_volume', x.track_volume),
    validateIdLike('total_unclaimed_tokens', x.total_unclaimed_tokens),
    validateIdLike('total_claimed_tokens', x.total_claimed_tokens),
    validateIdLike('current_sol_volume', x.current_sol_volume),
    // Fees
    validateString('fee_recipient', x.fee_recipient),
    validateIdLike('fee_basis_points', x.fee_basis_points),
    validateIdLike('fee', x.fee),
    // Creator fees
    validateString('creator', x.creator),
    validateIdLike('creator_fee_basis_points', x.creator_fee_basis_points),
    validateIdLike('creator_fee', x.creator_fee),
    // Time
    validateIdLike('timestamp', x.timestamp),
    validateIdLike('last_update_timestamp', x.last_update_timestamp),
  ]);

  return fail ?? { success: true, data: x as TransactionsInsertParams };
};

// ────────────────────────────────────────────────────────
// VALIDATOR REGISTRY
// ────────────────────────────────────────────────────────

export const EnhancedValidators: {
  [K in QueueName]: EnhancedValidator<QueuePayloadMap[K]>
} = {
  logIntake:                validateLogIntake,
  logEntry:                 validateLogEntry,
  txnEntry:                 validateTxnEntry,

  genesisLookup:            validateGenesisLookup,

  createEventEntry:         validateCreateEventEntry,
  tradeEventEntry:          validateTradeEventEntry,

  enrichmentPipelineEntry:  validateEnrichmentPipelineEntry,

  pairGenesisInsert:        validatePairGenesisInsert,
  metaDataGenesisInsert:    validateMetaDataGenesisInsert,
  transactionInsert:        validateTransactionInsert,

  onChainMetaDataEnrich:    validateOnchainEnrich,
  metaDataEnrich:           validateMetaEnrich,
  pairEnrich:               validatePairEnrich,

  offChainMetaDataEnrich:   validateIdentity,
  genesisEnrich:            validateIdentity,
  pairProvinenceEnrich:     validateIdentity,
} as const;

// ────────────────────────────────────────────────────────
// VALIDATION HELPER WITH DETAILED ERRORS
// ────────────────────────────────────────────────────────

export function validatePayloadEnhanced<T extends QueueName>(
  queue: T,
  payload: unknown
): QueuePayloadMap[T] {
  const validator = EnhancedValidators[queue];
  const result = validator(payload);

  if (!result.success) {
    throw new PipelineError(
      `Validation failed for queue "${queue}"`,
      {
        queue,
        phase: 'validation',
        field: result.field,
        reason: result.reason,
        value: result.value,
        payload,
      }
    );
  }

  return result.data;
}