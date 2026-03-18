import { processOHLC } from "./priceChart.server.js";
/* ---------------------------------------------
 * Route handler factory
 * --------------------------------------------- */
export function createOHLCHandler(ctx) {
    return async function handleOHLC(req) {
        const { pair_id } = req.params;
        const interval = parseInt(req.query.interval ?? "60", 10);
        const highlight_user_address = req.query.highlight_user ?? null;
        // Fetch transactions
        const txn_history = await ctx.get_transactions({ pair_id });
        // Process into OHLC
        const result = processOHLC({
            txn_history,
            interval_seconds: interval,
            highlight_user_address,
            pair_id,
            get_pair: ctx.get_pair,
            get_creation_decoded_data: ctx.get_creation_decoded_data,
        });
        return result;
    };
}
/* ---------------------------------------------
 * Response schema (for OpenAPI / validation)
 * --------------------------------------------- */
export const OHLCResponseSchema = {
    type: "object",
    properties: {
        ohlc: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    time: { type: "number" },
                    open: { type: "number" },
                    high: { type: "number" },
                    low: { type: "number" },
                    close: { type: "number" },
                    volume: { type: "number" },
                },
                required: ["time", "open", "high", "low", "close", "volume"],
            },
        },
        highlights: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    time: { type: "number" },
                    type: { type: "string", enum: ["buy", "sell"] },
                    user_address: { type: "string" },
                    sol_amount: { type: "number" },
                },
                required: ["time", "type", "user_address", "sol_amount"],
            },
        },
        meta: {
            type: "object",
            properties: {
                mint: { type: ["string", "null"] },
                creator_address: { type: ["string", "null"] },
                bonding_curve: { type: ["string", "null"] },
                init_price: { type: "number" },
                init_sol_amount: { type: "number" },
                init_token_amount: { type: "number" },
                init_virtualSolReserves: { type: "number" },
                init_virtualTokenReserves: { type: "number" },
            },
        },
    },
    required: ["ohlc", "highlights", "meta"],
};
