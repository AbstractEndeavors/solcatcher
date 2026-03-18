import type { RpcParamsContext, FetchParams, FetchOptions } from './../types.js';
export declare function getFetchOptions(params: FetchOptions): {
    method: string;
    headers: any;
    body: string;
};
export declare function fetchIt(params: FetchParams): Promise<Response>;
export declare function fetchRpc(url: string, options: RpcParamsContext): Promise<any>;
