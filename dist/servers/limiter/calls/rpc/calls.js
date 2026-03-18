import { asyncHandler, readPublicInput } from './../imports.js';
export async function getRpcCalls(limiter, app) {
    // --------------------
    // FETCH RPC
    // --------------------
    app.get("/fetch-rpc", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.fetchRpc(input));
    }));
    app.post("/fetch-rpc", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.fetchRpc(input));
    }));
    return app;
}
