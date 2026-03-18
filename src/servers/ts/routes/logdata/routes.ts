
import { type RpcParams,getRepoServices } from "./../imports.js";
export async function getLogDataCalls(app:any){
  // GET or POST /api/logdata/get-or-fetch
  app.post("/logdata/get-or-fetch", async (req, res) => {
    try {
      const { id, signature, limit }:RpcParams = req.body;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchOrCreate({ id, signature, limit });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/logdata/get-or-fetch", async (req, res) => {
    try {
      const { id, signature, limit }:RpcParams = req.query;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchOrCreate({ id, signature, limit });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/fetch
  app.post("/logdata/fetch", async (req, res) => {
    try {
      const { id, signature, limit, latest }:RpcParams = req.body;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetch({ id, signature, limit, latest });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/logdata/fetch", async (req, res) => {
    try {
      const { id, signature, limit, latest }:RpcParams = req.query;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetch({ id, signature, limit, latest });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/signature/:signature
  app.post("/logdata/signature/:signature", async (req, res) => {
    try {
      const { signature }:RpcParams = req.params;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchBySignature(signature);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/logdata/signature/:signature", async (req, res) => {
    try {
      const { signature }:RpcParams = req.params;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchBySignature(signature);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/id/:id
  app.post("/logdata/id/:id", async (req, res) => {
    try {
      const { id }:RpcParams = req.params;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchById(id);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/logdata/id/:id", async (req, res) => {
    try {
      const { id }:RpcParams = req.params;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchById(id);
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET or POST /api/logdata/unsorted
  app.post("/logdata/unsorted", async (req, res) => {
    try {
      const { limit, latest }:RpcParams = req.body;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchUnsorted({ limit, latest });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/logdata/unsorted", async (req, res) => {
    try {
      const { limit, latest }:RpcParams = req.query;
      const {logDataService} = await getRepoServices.services()
      const result = await logDataService.fetchUnsorted({ limit, latest });
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

return app;
}