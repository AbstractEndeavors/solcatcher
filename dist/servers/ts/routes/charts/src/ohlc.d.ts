import type { OHLCResponse, OHLCRouteContext } from './../imports/index.js';
export declare function createOHLCHandler(ctx: OHLCRouteContext): (req: {
    params: {
        pair_id: string;
    };
    query: {
        interval?: string;
        highlight_user?: string;
    };
}) => Promise<OHLCResponse>;
export declare const OHLCResponseSchema: {
    readonly type: "object";
    readonly properties: {
        readonly ohlc: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly time: {
                        readonly type: "number";
                    };
                    readonly open: {
                        readonly type: "number";
                    };
                    readonly high: {
                        readonly type: "number";
                    };
                    readonly low: {
                        readonly type: "number";
                    };
                    readonly close: {
                        readonly type: "number";
                    };
                    readonly volume: {
                        readonly type: "number";
                    };
                };
                readonly required: readonly ["time", "open", "high", "low", "close", "volume"];
            };
        };
        readonly highlights: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly time: {
                        readonly type: "number";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["buy", "sell"];
                    };
                    readonly user_address: {
                        readonly type: "string";
                    };
                    readonly sol_amount: {
                        readonly type: "number";
                    };
                };
                readonly required: readonly ["time", "type", "user_address", "sol_amount"];
            };
        };
        readonly meta: {
            readonly type: "object";
            readonly properties: {
                readonly mint: {
                    readonly type: readonly ["string", "null"];
                };
                readonly creator_address: {
                    readonly type: readonly ["string", "null"];
                };
                readonly bonding_curve: {
                    readonly type: readonly ["string", "null"];
                };
                readonly init_price: {
                    readonly type: "number";
                };
                readonly init_sol_amount: {
                    readonly type: "number";
                };
                readonly init_token_amount: {
                    readonly type: "number";
                };
                readonly init_virtualSolReserves: {
                    readonly type: "number";
                };
                readonly init_virtualTokenReserves: {
                    readonly type: "number";
                };
            };
        };
    };
    readonly required: readonly ["ohlc", "highlights", "meta"];
};
