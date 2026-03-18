 import {asyncHandler,readPublicInput} from './../imports.js';
export async function getBalanceCalls(limiter: any,app:any) {
// --------------------
  // FETCH AccountInfo
  // --------------------
  app.post("/fetch-balance", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await limiter.getBalance(input));
  }));
  app.get("/fetch-balance", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await limiter.getBalance(input));
  }));
return app;
}