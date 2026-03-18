import { asyncHandler, readPublicInput } from './../imports.js';
export async function getBalanceCalls(limiter, app) {
    // --------------------
    // FETCH AccountInfo
    // --------------------
    app.post("/fetch-balance", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.getBalance(input));
    }));
    app.get("/fetch-balance", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.getBalance(input));
    }));
    return app;
}
