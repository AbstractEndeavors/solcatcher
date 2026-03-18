import { asyncHandler, readPublicInput } from './../imports.js';
export async function getMetaDataCalls(limiter, app) {
    // --------------------
    // FETCH METADATA
    // --------------------
    app.get("/fetch-metadata", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        const result = await limiter.fetchMetaData(input.mint);
        res.json(result);
    }));
    app.post("/fetch-metadata", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        const result = await limiter.fetchMetaData(input.mint);
        res.json(result);
    }));
    return app;
}
