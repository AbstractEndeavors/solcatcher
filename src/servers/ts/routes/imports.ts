import type { IdLike,SigLike,LimitLike,BoolLike,DataLike,MintLike,AddressLike } from "@imports";
import {extractRow} from '@imports';
import { getRepoServices} from "@repoServices";
import { fetchMetaData } from "@rateLimiter";
export interface RpcParams {
  id?:IdLike,
  signature?:SigLike,
  limit?:LimitLike,
  latest?:BoolLike,
  mint?:MintLike,
  account?:AddressLike

}
export function getRpcParams(req: any): RpcParams {
  return req.method === "POST" ? req.body : req.query;
}

export async function fetchFromChain(params:RpcParams){
    let { id, mint,limit,latest} = params
    let result:DataLike = null
    if (!mint){
      const {metaDataService} = await getRepoServices.services()
      let metaData = await metaDataService.fetch({ id, mint,limit,latest})
      if (metaData){
        mint = extractRow(metaData)?.mint
      }
    }
    
    if (!mint){
      return result
    }
    return await fetchMetaData(mint);
}

export {fetchMetaData,getRepoServices,extractRow}