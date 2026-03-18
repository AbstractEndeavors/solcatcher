import { getRepoServices } from "./../imports.js";
export async function getTransactionCalls(app) {
    /**
     * POST /ts-api/transactions/by-ids
     * Body: { ids: number[] }
     */
    app.post("/transactions/by-ids", async (req, res) => {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids)) {
                return res.status(400).json({
                    error: "ids must be an array of transaction IDs",
                });
            }
            if (ids.length === 0) {
                return res.json([]);
            }
            const { transactionsService } = await getRepoServices.services();
            const txns = await transactionsService.fetchByIds(ids);
            res.json(txns);
        }
        catch (err) {
            res.status(500).json({
                error: err?.message ?? "failed to fetch transactions by ids",
            });
        }
    });
    // GET or POST /api/transactions/fetch
    app.post("/transactions/fetch", async (req, res) => {
        try {
            const { id, signature, limit, latest } = req.body;
            const { transactionsService } = await getRepoServices.services();
            const result = await transactionsService.fetch({ id, signature, limit, latest });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.get("/transactions/fetch", async (req, res) => {
        try {
            const { id, signature, limit, latest } = req.query;
            const { transactionsService } = await getRepoServices.services();
            const result = await transactionsService.fetch({ id, signature, limit, latest });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // GET or POST /api/transactions/signature/:signature
    app.post("/transactions/signature/:signature", async (req, res) => {
        try {
            const { signature } = req.params;
            const { transactionsService } = await getRepoServices.services();
            const result = await transactionsService.fetchBySignature(signature);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.get("/transactions/signature/:signature", async (req, res) => {
        try {
            const { signature } = req.params;
            const { transactionsService } = await getRepoServices.services();
            const result = await transactionsService.fetchBySignature(signature);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // GET or POST /api/transactions/id/:id
    app.post("/transactions/id/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { transactionsService } = await getRepoServices.services();
            const result = await transactionsService.fetchById(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.get("/transactions/id/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { transactionsService } = await getRepoServices.services();
            const result = await transactionsService.fetchById(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    return app;
}
