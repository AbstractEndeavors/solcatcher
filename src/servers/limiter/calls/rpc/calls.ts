 import {asyncHandler,readPublicInput} from './../imports.js';
export async function getRpcCalls(limiter: any,app:any) {
// --------------------
  // FETCH RPC
  // --------------------
  app.get("/fetch-rpc", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await limiter.fetchRpc(input));
  }));

  app.post("/fetch-rpc", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await limiter.fetchRpc(input));
  }));
return app;
}