import { asyncHandler, readPublicInput } from './../imports.js';
export async function getTransactionCalls(limiter, app) {
    // --------------------
    // FETCH Transaction
    // --------------------
    app.get("/fetch-transaction", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.getTransaction(input));
    }));
    app.post("/fetch-transaction", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.getTransaction(input));
    }));
    return app;
}
