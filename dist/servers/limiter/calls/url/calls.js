import { asyncHandler, readPublicInput } from './../imports.js';
export async function getUrlCalls(limiter, app) {
    // --------------------
    // GET URL
    // --------------------
    app.post("/get-url", asyncHandler(async (req, res) => {
        const { method } = readPublicInput(req);
        const url = await limiter.getUrl(method);
        if (!url || typeof url !== "string") {
            throw new Error(`Limiter returned invalid URL: ${String(url)}`);
        }
        res.json(url);
    }));
    app.post("/get-url", asyncHandler(async (req, res) => {
        const { method } = readPublicInput(req);
        res.json(await limiter.getUrl(method));
    }));
    // --------------------
    // GET FALLBACK
    // --------------------
    app.get("/get-fallback", asyncHandler(async (req, res) => {
        res.json(await limiter.getFallbackUrl());
    }));
    app.post("/get-fallback", asyncHandler(async (req, res) => {
        res.json(await limiter.getFallbackUrl());
    }));
    // --------------------
    // LOG RESPONSE (POST PRIMARY)
    // --------------------
    app.post("/log-response", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.logResponse(input));
    }));
    // GET allowed but discouraged
    app.get("/log-response", asyncHandler(async (req, res) => {
        const input = readPublicInput(req);
        res.json(await limiter.logResponse(input));
    }));
    return app;
}
