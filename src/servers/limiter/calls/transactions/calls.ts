 import {asyncHandler,readPublicInput} from './../imports.js';
export async function getTransactionCalls(limiter: any,app:any) {
 // --------------------
  // FETCH Transaction
  // --------------------
  app.get("/fetch-transaction", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await limiter.getTransaction(input));
  }));

  app.post("/fetch-transaction", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await limiter.getTransaction(input));
  }));
return app;
}