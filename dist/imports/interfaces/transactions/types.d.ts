import type { IdLike, AddressLike, IntLike, SigLike, MintLike, DataLike, TradeInstruction, DbParams, BigIntLike } from './imports.js';
import type { PoolClient } from './../pools/index.js';
import type { SolanaTransactionResponse } from './transform_solana_tx.js';
export interface TransactionsNode {
    program_id: AddressLike;
    logs?: DataLike[];
    data?: DataLike[];
    depth?: IntLike;
    invocation_index: IntLike;
    reported_invocation?: IntLike;
    children?: TransactionsNode[];
}
export interface TransactionsInsertDTO {
    log_id: IdLike;
    pair_id: IdLike;
    meta_id: IdLike;
    signature: SigLike;
    program_id: AddressLike;
    slot: IntLike;
    invocation: IntLike;
    mint: MintLike;
    user_address: AddressLike;
    is_buy: boolean;
    ix_name: TradeInstruction;
    sol_amount: BigIntLike;
    token_amount: BigIntLike;
    virtual_sol_reserves: BigIntLike;
    virtual_token_reserves: BigIntLike;
    real_sol_reserves: BigIntLike;
    real_token_reserves: BigIntLike;
    mayhem_mode: boolean;
    price: IntLike;
    track_volume: boolean;
    total_unclaimed_tokens: IntLike;
    total_claimed_tokens: IntLike;
    current_sol_volume: IntLike;
    fee_recipient: AddressLike;
    fee_basis_points: IntLike;
    fee: IntLike;
    creator: AddressLike;
    creator_fee_basis_points: IntLike;
    creator_fee: IntLike;
    timestamp: IntLike;
    last_update_timestamp: IntLike;
}
export interface TransactionCallback<T> {
    (client: PoolClient): Promise<T>;
}
export interface CallTransactionParams extends DbParams {
    signature?: SigLike;
}
export interface FetchTransactionParams extends CallTransactionParams {
    until?: SigLike;
    before?: SigLike;
}
export type FetchedTransaction = {
    signature: SigLike;
    tx: SolanaTransactionResponse;
};
