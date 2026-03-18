import type { IdLike, SigLike, LimitLike, BoolLike, MintLike, AddressLike } from "@imports";
import { extractRow } from '@imports';
import { getRepoServices } from "@repoServices";
import { fetchMetaData } from "@rateLimiter";
export interface RpcParams {
    id?: IdLike;
    signature?: SigLike;
    limit?: LimitLike;
    latest?: BoolLike;
    mint?: MintLike;
    account?: AddressLike;
}
export declare function getRpcParams(req: any): RpcParams;
export declare function fetchFromChain(params: RpcParams): Promise<any>;
export { fetchMetaData, getRepoServices, extractRow };
