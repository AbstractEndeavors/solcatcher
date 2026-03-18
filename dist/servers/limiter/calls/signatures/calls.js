import { asyncHandler } from './../imports.js';
export async function getSignatureCalls(limiter, app) {
    // --------------------
    // FETCH SignaturesForAddress
    // --------------------
    app.post("/fetch-signaturesForAddress/", asyncHandler(async (req, res) => {
        const input = req.body;
        if (!input?.account) {
            return res.status(400).json({
                error: "Missing required field: account"
            });
        }
        const result = await limiter.getSignaturesForAddress(input);
        // ✅ EXPLICIT HEADERS - no chunking issues
        const payload = JSON.stringify(result);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', Buffer.byteLength(payload, 'utf8'));
        res.setHeader('Connection', 'keep-alive');
        return res.end(payload);
    }));
    app.get("/fetch-signaturesForAddress/", asyncHandler(async (req, res) => {
        const { account, until, before, limit, commitment } = req.query;
        if (!account) {
            return res.status(400).json({ error: "Missing required field: account" });
        }
        const input = {
            account,
            until: until ?? undefined,
            before: before ?? undefined,
            limit: limit ? Number(limit) : undefined,
            commitment
        };
        const result = await limiter.getSignaturesForAddress(input);
        const payload = JSON.stringify(result);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Length", Buffer.byteLength(payload));
        res.setHeader("Connection", "keep-alive");
        return res.end(payload);
    }));
    return app;
}
