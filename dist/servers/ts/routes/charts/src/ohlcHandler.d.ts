export declare function getOHLCHandler(): Promise<(req: {
    params: {
        pair_id: string;
    };
    query: {
        interval?: string;
        highlight_user?: string;
    };
}) => Promise<import("../index.js").OHLCResponse>>;
