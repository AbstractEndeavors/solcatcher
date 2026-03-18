// routes/pairs.ts
import { getRepoServices } from "./../imports.js";
import {createOHLCHandler} from './../charts/index.js'

export async function getPairCalls(app:any){
  const { pairsService } = await getRepoServices.services();
  app.get("/pairs/fetch", async (req, res) => {
    try {
      const { id, mint, program_id } = req.query;
      res.json(await pairsService.fetch({ id, mint, program_id }));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/pairs/id/:id", async (req, res) => {
    try {
      res.json(await pairsService.fetchById(req.params.id));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/pairs/mint/:mint", async (req, res) => {
    try {
      res.json(await pairsService.fetchByMint(req.params.mint));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/pairs/mint/:mint/program/:program_id", async (req, res) => {
    try {
      const { mint, program_id } = req.params;
      res.json(await pairsService.fetchByMintAndProgram({ mint, program_id }));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/pairs/cursor", async (req, res) => {
    try {
      const limit = Number(req.query.limit ?? 500);

      const cursor =
        req.query.cursor_created_at && req.query.cursor_id
          ? {
              created_at: new Date(String(req.query.cursor_created_at)),
              id: Number(req.query.cursor_id),
            }
          : undefined;

      res.json(
        await pairsService.getCursorPage({
          limit,
          cursor,
        })
      );
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });



  const ohlcHandler = createOHLCHandler({
    get_transactions: async ({ pair_id }) => {
      // adapt this to however you fetch txns
      return await pairsService.getTransactionsByPairId(pair_id);
    },
    get_pair: pairsService.getPair,
    get_creation_decoded_data: pairsService.getCreationDecodedData,
  });

  /* ---------------------------------------------
  * Routes
  * --------------------------------------------- */

  app.get("/pairs/api/pairs/:pair_id/ohlc/", async (req, res) => {
    try {
      const result = await ohlcHandler({
        params: { pair_id: req.params.pair_id },
        query: {
          interval: req.query.interval as string | undefined,
          highlight_user: req.query.highlight_user as string | undefined,
        },
      });

      res.json(result);
    } catch (e) {
      res.status(500).json({
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  });
  // GET or POST /api/pairs/get-or-fetch
  app.post("/pairs/get-or-fetch", async (req, res) => {
    try {
      const { id, mint, program_id } = req.body;
      const {pairsService} = await getRepoServices.services()
      const result = await pairsService.fetch({ id, mint, program_id });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/pairs/get-or-fetch", async (req, res) => {
    try {
      const { id, mint, program_id }: any = req.query;
      const {pairsService} = await getRepoServices.services()
      const result = await pairsService.fetch({ id, mint, program_id });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });



  return app;
}
