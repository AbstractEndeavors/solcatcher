// src/pipeline/pda/schemas.ts
import { PublicKey } from '@solana/web3.js';
import { getPubkeyString, getPubkey, ensureString } from '@imports';
// ═══════════════════════════════════════════════════════════
// SCHEMA BASE
// ═══════════════════════════════════════════════════════════
class Schema {
    constructor() {
        this.validate();
    }
}
// ═══════════════════════════════════════════════════════════
// INPUT VALIDATION
// ═══════════════════════════════════════════════════════════
export class MintParam extends Schema {
    pubkey;
    address;
    constructor(mint) {
        super();
        this.pubkey = getPubkey(mint);
        this.address = getPubkeyString(this.pubkey);
    }
    validate() {
        // PublicKey constructor throws if invalid
    }
}
export class ProgramParam extends Schema {
    pubkey;
    address;
    constructor(program_id) {
        super();
        this.pubkey = getPubkey(program_id);
        this.address = getPubkeyString(this.pubkey);
    }
    validate() {
        // PublicKey constructor throws if invalid
    }
}
// ═══════════════════════════════════════════════════════════
// RESULT WRAPPERS
// ═══════════════════════════════════════════════════════════
export class DerivedPDAsResult {
    mint;
    metaplex;
    bonding_curve;
    associated_bonding_curve;
    program_id;
    token_program;
    constructor(mint, metaplex, bonding_curve, associated_bonding_curve, program_id, token_program) {
        this.mint = mint;
        this.metaplex = metaplex;
        this.bonding_curve = bonding_curve;
        this.associated_bonding_curve = associated_bonding_curve;
        this.program_id = program_id;
        this.token_program = token_program;
    }
    toJSON() {
        return {
            mint: this.mint,
            metaplex: this.metaplex,
            bonding_curve: this.bonding_curve,
            associated_bonding_curve: this.associated_bonding_curve,
            program_id: this.program_id,
        };
    }
}
export class BondingCurveDataResult {
    mint;
    creator;
    virtual_token_reserves;
    virtual_sol_reserves;
    real_token_reserves;
    real_sol_reserves;
    token_total_supply;
    is_complete;
    token_program;
    constructor(mint, creator, virtual_token_reserves, virtual_sol_reserves, real_token_reserves, real_sol_reserves, token_total_supply, is_complete, token_program) {
        this.mint = mint;
        this.creator = creator;
        this.virtual_token_reserves = virtual_token_reserves;
        this.virtual_sol_reserves = virtual_sol_reserves;
        this.real_token_reserves = real_token_reserves;
        this.real_sol_reserves = real_sol_reserves;
        this.token_total_supply = token_total_supply;
        this.is_complete = is_complete;
        this.token_program = token_program;
    }
    toJSON() {
        return {
            mint: this.mint,
            creator: this.creator,
            virtual_token_reserves: ensureString(this.virtual_token_reserves),
            virtual_sol_reserves: ensureString(this.virtual_sol_reserves),
            real_token_reserves: ensureString(this.real_token_reserves),
            real_sol_reserves: ensureString(this.real_sol_reserves),
            token_total_supply: ensureString(this.token_total_supply),
            is_complete: this.is_complete,
            token_program: this.token_program,
        };
    }
}
export class GenesisInfoResult {
    signature;
    block_time;
    slot;
    creator;
    source;
    constructor(signature, block_time, slot, creator, source) {
        this.signature = signature;
        this.block_time = block_time;
        this.slot = slot;
        this.creator = creator;
        this.source = source;
    }
    toJSON() {
        return {
            signature: this.signature,
            block_time: this.block_time,
            slot: this.slot,
            creator: this.creator,
            source: this.source,
        };
    }
}
export class TokenPDAInfoResult {
    pdas;
    bonding_curve_data;
    genesis;
    constructor(pdas, bonding_curve_data, genesis) {
        this.pdas = pdas;
        this.bonding_curve_data = bonding_curve_data;
        this.genesis = genesis;
    }
    toJSON() {
        return {
            pdas: this.pdas.toJSON(),
            bonding_curve_data: this.bonding_curve_data?.toJSON() ?? null,
            genesis: this.genesis?.toJSON() ?? null,
        };
    }
}
