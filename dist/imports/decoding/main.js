import { buildRegistryFromIdls, DecoderRegistry } from "./src/index.js";
import grpc_stream_and_parse_pump_amm_account from "./src/idls/new/PumpFun/Typescript/grpc-stream-and-parse-pump-amm-account/idls/pump_amm_0.1.0.json" with { type: "json" };
import grpc_stream_and_parse_pump_amm_transaction from "./src/idls/new/PumpFun/Typescript/grpc-stream-and-parse-pump-amm-transaction/idls/pump_amm_0.1.0.json" with { type: "json" };
import stream_and_parse_all_pump_fun_accounts from "./src/idls/new/PumpFun/Typescript/stream_and_parse_all_pump_fun_accounts/Idl/pump_0.1.0.json" with { type: "json" };
import stream_and_parse_pump_fun_transactions from "./src/idls/new/PumpFun/Typescript/stream_and_parse_pump_fun_transactions/idls/pump_0.1.0.json" with { type: "json" };
import stream_new_pool_pump_swap_amm from "./src/idls/new/PumpFun/Typescript/stream_new_pool_pump_swap_amm/idls/pump_amm_0.1.0.json" with { type: "json" };
import stream_pump_amm_token_price from "./src/idls/new/PumpFun/Typescript/stream_pump_amm_token_price/idls/pump_amm_0.1.0.json" with { type: "json" };
import stream_pump_amm_transactions_and_detect_buy_sell_events from "./src/idls/new/PumpFun/Typescript/stream_pump_amm_transactions_and_detect_buy_sell_events/idls/pump_amm_0.1.0.json" with { type: "json" };
import stream_pump_fun_bonding_curve_progress_accounts from "./src/idls/new/PumpFun/Typescript/stream_pump_fun_bonding_curve_progress_accounts/Idl/pump_0.1.0.json" with { type: "json" };
import stream_pump_fun_new_minted_tokens from "./src/idls/new/PumpFun/Typescript/stream_pump_fun_new_minted_tokens/idls/pump_0.1.0.json" with { type: "json" };
import stream_pumpfun_token_price from "./src/idls/new/PumpFun/Typescript/stream_pumpfun_token_price/idls/pump_0.1.0.json" with { type: "json" };
import stream_pumpfun_to_pumpAmm_migration_transactions from "./src/idls/new/PumpFun/Typescript/stream_pumpfun_to_pumpAmm_migration_transactions/idls/pump_0.1.0.json" with { type: "json" };
import stream_pump_fun_transactions_and_detect_buy_sell_events from "./src/idls/new/PumpFun/Typescript/stream_pump_fun_transactions_and_detect_buy_sell_events/idls/pump_0.1.0.json" with { type: "json" };
import stream_pumpfun_txns_fetch_bonding_pool_liquidity_idl from "./src/idls/new/PumpFun/Typescript/stream_pumpfun_txns_fetch_bonding_pool_liquidity/idls/idl.json" with { type: "json" };
import stream_pumpfun_txns_fetch_bonding_pool_liquidity from "./src/idls/new/PumpFun/Typescript/stream_pumpfun_txns_fetch_bonding_pool_liquidity/idls/pump_0.1.0.json" with { type: "json" };
function asIdl(json) {
    return json;
}
function withAddress(idl, address) {
    return {
        ...idl,
        address,
    };
}
export function getAllIdls() {
    return [
        grpc_stream_and_parse_pump_amm_account,
        grpc_stream_and_parse_pump_amm_transaction,
        stream_and_parse_all_pump_fun_accounts,
        stream_and_parse_pump_fun_transactions,
        stream_new_pool_pump_swap_amm,
        stream_pump_amm_token_price,
        stream_pump_amm_transactions_and_detect_buy_sell_events,
        stream_pump_fun_bonding_curve_progress_accounts,
        stream_pump_fun_new_minted_tokens,
        stream_pumpfun_token_price,
        stream_pumpfun_to_pumpAmm_migration_transactions,
        stream_pump_fun_transactions_and_detect_buy_sell_events,
        withAddress(stream_pumpfun_txns_fetch_bonding_pool_liquidity_idl, "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
        withAddress(stream_pumpfun_txns_fetch_bonding_pool_liquidity, "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
    ];
}
let _registry = null;
export function getDecoderRegistry() {
    if (!_registry) {
        const idls = getAllIdls();
        _registry = buildRegistryFromIdls(idls);
    }
    return _registry;
}
// Usage
export const DECODER_REGISTRY = getDecoderRegistry();
export function initializeRegistry() {
    // Or register explicitly:
    // registry.register(pumpIdl, PUMP_FUN_PROGRAM_ID);
    // registry.register(pumpAmmIdl, PUMP_AMM_PROGRAM_ID);
    return getDecoderRegistry();
}
export const UNKNOWN_DECODE = {
    name: 'unknown',
    category: 'unknown',
    data: {}
};
export function unknownDecode(reason, extra) {
    return {
        name: 'unknown',
        category: 'decode_error',
        data: {
            reason,
            ...extra
        }
    };
}
export function getDecodeFromPayload(payload) {
    try {
        if (!payload?.b64 || typeof payload.b64 !== 'string') {
            return unknownDecode('missing_or_invalid_payload');
        }
        const raw = Buffer.from(payload.b64, 'base64');
        const decoded = DECODER_REGISTRY.decode(raw);
        // Defensive normalization (in case decoder returns weirdness)
        return {
            name: decoded?.name ?? 'unknown',
            category: decoded?.category ?? 'unknown',
            data: (decoded?.data && typeof decoded.data === 'object')
                ? decoded.data
                : {}
        };
    }
    catch (err) {
        return unknownDecode('decode_exception', {
            message: err instanceof Error ? err.message : String(err)
        });
    }
}
