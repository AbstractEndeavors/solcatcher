import { getRepoServices,fetchMetaData,getRpcParams,type RpcParams } from "./../imports.js";
export async function getMetaDataCalls(app:any){
  // GET or POST /api/logdata/get-or-fetch
  /*app.post("/metadata/get-or-fetch", async (req, res) => {
    try {
      const { id, mint, limit,latest }:RpcParams = req.body;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchOrCreate({ id, mint, limit,latest },fetchMetaData);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/metadata/get-or-fetch", async (req, res) => {
    try {
      const { id, mint, limit,latest }:RpcParams = req.body;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchOrCreate({ id, mint, limit,latest },fetchMetaData);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });*/

  app.post("/metadata/pair", async (req, res) => {
    try {
      const { id } = getRpcParams(req);
      if (!id) {
        return res.status(400).json({ error: "id required" });
      }

      const { metaDataService, pairsService } =
        await getRepoServices.services();

      const pairData = await pairsService.fetchById(id);
      if (!pairData?.mint) {
        return res.status(404).json({ error: "pair not found" });
      }

      const result = await metaDataService.fetchByMint(pairData.mint);
      res.json(result);
    } catch (error: any) {
      console.error("POST /metadata/pair failed", error);
      res.status(500).json({ error: error.message });
    }
  });


  app.get("/metadata/pair", async (req, res) => {
    try {
      const { id } = getRpcParams(req);
      const {metaDataService,pairsService} = await getRepoServices.services()
      const pairData = await pairsService.fetchById(id)
      if (!pairData){
        return 
      }
      const result = await metaDataService.fetchByMint(pairData.mint);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });
  /*// GET or POST /api/logdata/get-or-fetch
  app.post("/metadata/fetch-from-chain", async (req, res) => {
    try {
      const { id, mint, limit,latest }:RpcParams = req.body;
      const result = await fetchFromChain({ id, mint, limit,latest })
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/metadata/fetch-from-chain", async (req, res) => {
    try {
      const { id, mint, limit,latest }:RpcParams = req.body;
      const result = await fetchFromChain({ id, mint, limit,latest })
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });*/

  // GET or POST /api/logdata/fetch
  app.post("/metadata/fetch", async (req, res) => {
    try {
      const { id, mint, limit, latest }:RpcParams = req.body;
      const {metaDataRepo} = await getRepoServices.repos()
      const result = await metaDataRepo.fetch({ id, mint });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/metadata/fetch", async (req, res) => {
    try {
      const { id, mint, limit, latest }:RpcParams = req.body;
      const {metaDataRepo} = await getRepoServices.repos()
      const result = await metaDataRepo.fetch({ id, mint});
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/mint/:mint
  app.post("/metadata/mint/:mint", async (req, res) => {
    try {
      const { mint }:RpcParams = req.params;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchByMint(mint);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/metadata/mint/:mint", async (req, res) => {
    try {
      const { mint }:RpcParams = req.params;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchByMint(mint);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/id/:id
  app.post("/metadata/id/:id", async (req, res) => {
    try {
      const { id }:RpcParams = req.params;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchById(id);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/metadata/id/:id", async (req, res) => {
    try {
      const { id }:RpcParams = req.params;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchById(id);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/unsorted
  /*app.post("/metadata/unsorted", async (req, res) => {
    try {
      const { limit, latest }:RpcParams = req.body;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchUnsorted({ limit, latest });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/metadata/unsorted", async (req, res) => {
    try {
      const { limit, latest }:RpcParams = req.body;
      const {metaDataService} = await getRepoServices.services()
      const result = await metaDataService.fetchUnsorted({ limit, latest });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });*/

  return app;
}