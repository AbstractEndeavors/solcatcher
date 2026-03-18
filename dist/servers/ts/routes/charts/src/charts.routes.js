// ts-apis/routes/charts.routes.ts
// Chart data endpoint - wired to actual services
import { Router } from "express";
import { getOHLCHandler } from "./ohlc.js";
import { getRepoServices } from "@repoServices";
const router = Router();
// POST /api/charts/get-chart-data
router.post("/get-chart-data", async (req, res) => {
    try {
        const { id, interval, highlight_user } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Missing required field: id" });
        }
        const handler = await getOHLCHandler();
        const result = await handler({
            params: { pair_id: String(id) },
            query: {
                interval: interval ?? "60",
                highlight_user: highlight_user ?? undefined,
            },
        });
        res.json(result);
    }
    catch (error) {
        console.error("Chart data error:", error);
        res.status(500).json({ error: error.message ?? "Failed to generate chart data" });
    }
});
// GET /api/charts/pairs/:pair_id/ohlc
router.get("/pairs/:pair_id/ohlc", async (req, res) => {
    try {
        const handler = await getOHLCHandler();
        const result = await handler({
            params: { pair_id: req.params.pair_id },
            query: req.query,
        });
        res.json(result);
    }
    catch (error) {
        console.error("OHLC error:", error);
        res.status(500).json({ error: error.message ?? "Failed to fetch OHLC" });
    }
});
export default router;
