import {asyncHandler,readPublicInput} from './../imports.js';
import {FetchAccountInfo} from './functions.js'
export async function getAccountInfoCalls(limiter: any,app:any) {

  app.post("/fetch-accountInfo", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    res.json(await FetchAccountInfo(limiter,input));
  }));
    // --------------------
  // FETCH AccountInfoInfo
  // --------------------
  app.get("/fetch-accountInfoJsonParsed", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    input.endoding='jsonParsed'
    res.json(await limiter.getAccountInfoJsonParsed(input));
  }));

  app.post("/fetch-accountInfoJsonParsed", asyncHandler( async (req:any, res:any) => {
    const input = readPublicInput(req);
    input.endoding='jsonParsed'
    res.json(await FetchAccountInfo(limiter,input));
  }));
return app;
}